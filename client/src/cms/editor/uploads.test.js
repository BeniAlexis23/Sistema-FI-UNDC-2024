import { describe, expect, it, vi } from 'vitest';
import { uploadMediaRequest } from '../../api/media';
import { prepareImageForUpload } from './imagePrep.js';
import { MAX_IMAGE_MB, uploadErrorMessage, uploadImage, validateImageFile } from './uploads.js';

vi.mock('../../api/media', () => ({ uploadMediaRequest: vi.fn(async () => ({ data: { url: '/uploads/x.webp' } })) }));
vi.mock('./imagePrep.js', () => ({ prepareImageForUpload: vi.fn(async () => 'archivo-reducido') }));

const MEGABYTE = 1024 * 1024;
const photo = (type, megabytes) => ({ type, size: megabytes * MEGABYTE });
const failure = (status, data) => ({ response: { status, data } });

describe('validateImageFile', () => {
  it('accepts JPG, PNG and WebP, including photos well above the old 5 MB limit', () => {
    expect(validateImageFile(photo('image/jpeg', 12))).toBeNull();
    expect(validateImageFile(photo('image/png', MAX_IMAGE_MB))).toBeNull();
    expect(validateImageFile(photo('image/webp', 0.2))).toBeNull();
  });

  it('rejects other formats and files over the limit', () => {
    expect(validateImageFile(photo('image/gif', 1))).toBe('Solo se aceptan imágenes JPG, PNG o WebP.');
    expect(validateImageFile(photo('image/jpeg', MAX_IMAGE_MB + 1))).toBe(`La imagen supera los ${MAX_IMAGE_MB} MB.`);
  });
});

describe('uploadErrorMessage', () => {
  it.each([
    [413, /por su peso/],
    [415, /JPG, PNG o WebP/],
    [429, /demasiadas imágenes/],
  ])('explains the %i status in Spanish', (status, message) => {
    expect(uploadErrorMessage(failure(status, { message: 'English message from the API' }))).toMatch(message);
  });

  it('falls back to the API message and then to a generic one', () => {
    expect(uploadErrorMessage(failure(400, ['Image file is required']))).toBe('Image file is required');
    expect(uploadErrorMessage(failure(500, { message: 'Internal server error' }))).toBe('Internal server error');
    expect(uploadErrorMessage({})).toBe('No se pudo subir la imagen');
  });

  it('tells a server filter apart from an expired session on a 403', () => {
    // un proxy o un cortafuegos responde con HTML o sin cuerpo; la aplicación siempre responde con un mensaje
    expect(uploadErrorMessage(failure(403, '<html><h1>Forbidden</h1></html>'))).toMatch(/filtro del servidor/);
    expect(uploadErrorMessage(failure(403, ''))).toMatch(/filtro del servidor/);
    expect(uploadErrorMessage(failure(403, { message: 'Invalid token' }))).toMatch(/sesión/);
    expect(uploadErrorMessage(failure(403, { message: 'Request origin is not allowed' }))).toBe('Request origin is not allowed');
  });

  it('explains a lost session, a lost connection and an unreachable server', () => {
    expect(uploadErrorMessage(failure(401, { message: 'No token, authorization denied' }))).toMatch(/sesión/);
    expect(uploadErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/No hay conexión/);
    expect(uploadErrorMessage({ code: 'ECONNABORTED' })).toMatch(/No hay conexión/);
    for (const status of [502, 503, 504]) {
      expect(uploadErrorMessage(failure(status, '<html>Bad gateway</html>'))).toMatch(/no respondió/);
    }
  });
});

describe('uploadImage', () => {
  it('sends the reduced file instead of the original and reports the progress', async () => {
    const original = photo('image/jpeg', 12);
    const onProgress = vi.fn();

    const result = await uploadImage(original, onProgress);

    expect(prepareImageForUpload).toHaveBeenCalledWith(original);
    expect(uploadMediaRequest).toHaveBeenCalledWith('archivo-reducido', expect.any(Function));
    expect(result).toEqual({ url: '/uploads/x.webp' });

    const reportProgress = uploadMediaRequest.mock.calls[0][1];
    reportProgress({ loaded: 25, total: 100 });
    reportProgress({ loaded: 5 });
    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(25);
  });
});
