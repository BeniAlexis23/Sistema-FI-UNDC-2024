import { describe, expect, it } from 'vitest';
import { getApiErrors, hasApiMessage, isServerFilterBlock } from './errors.js';

const failure = (status, data) => ({ response: { status, data } });

describe('isServerFilterBlock', () => {
  it('recognizes a 403 that did not come from the application', () => {
    // el Apache de delante responde con su página HTML; la aplicación siempre responde con un mensaje en JSON
    expect(isServerFilterBlock(failure(403, '<!DOCTYPE HTML><h1>Forbidden</h1>'))).toBe(true);
    expect(isServerFilterBlock(failure(403, ''))).toBe(true);
    expect(isServerFilterBlock(failure(403, undefined))).toBe(true);
  });

  it('does not take the application responses or other statuses for a filter', () => {
    expect(isServerFilterBlock(failure(403, { message: 'Invalid token' }))).toBe(false);
    expect(isServerFilterBlock(failure(403, ['Request origin is not allowed']))).toBe(false);
    expect(isServerFilterBlock(failure(401, '<html></html>'))).toBe(false);
    expect(isServerFilterBlock(failure(500, ''))).toBe(false);
    expect(isServerFilterBlock({})).toBe(false);
  });
});

describe('hasApiMessage', () => {
  it('accepts a message string or a list of messages only', () => {
    expect(hasApiMessage({ message: 'x' })).toBe(true);
    expect(hasApiMessage(['x'])).toBe(true);
    expect(hasApiMessage('<html></html>')).toBe(false);
    expect(hasApiMessage({ message: 5 })).toBe(false);
  });
});

describe('getApiErrors', () => {
  it('prefers the list, then the message, then the fallback', () => {
    expect(getApiErrors(failure(400, ['a', 'b']))).toEqual(['a', 'b']);
    expect(getApiErrors(failure(400, { message: 'm' }))).toEqual(['m']);
    expect(getApiErrors(failure(500, '<html></html>'), 'No se pudo')).toEqual(['No se pudo']);
    expect(getApiErrors({})).toEqual(['Ocurrió un error inesperado']);
  });
});
