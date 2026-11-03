import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_MB, uploadErrorMessage, validateImageFile } from './uploads.js';

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
});
