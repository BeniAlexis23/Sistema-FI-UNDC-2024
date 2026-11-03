import { describe, expect, it, vi } from 'vitest';
import { canReload, reloadOnStaleChunk } from './staleChunk.js';

const fakeStorage = (initial = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
};

const fakeWindow = (storage = fakeStorage()) => {
  const target = new EventTarget();
  target.sessionStorage = storage;
  target.location = { reload: vi.fn() };
  return target;
};

const preloadError = () => new Event('vite:preloadError', { cancelable: true });

describe('reload when a chunk from an older deploy is gone', () => {
  it('reloads the page and keeps Vite from throwing the import error', () => {
    const target = fakeWindow();
    reloadOnStaleChunk(target);
    const event = preloadError();
    target.dispatchEvent(event);
    expect(target.location.reload).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not loop when the file is still missing after reloading', () => {
    const target = fakeWindow();
    reloadOnStaleChunk(target);
    target.dispatchEvent(preloadError());
    const second = preloadError();
    target.dispatchEvent(second);
    expect(target.location.reload).toHaveBeenCalledTimes(1);
    // sin preventDefault Vite vuelve a lanzar el error original y se ve en pantalla
    expect(second.defaultPrevented).toBe(false);
  });

  it('allows another reload once the waiting period has passed', () => {
    const target = fakeWindow();
    expect(canReload(target, 1_000_000)).toBe(true);
    expect(canReload(target, 1_010_000)).toBe(false);
    expect(canReload(target, 1_031_000)).toBe(true);
  });

  it('ignores a stored value that is not a timestamp', () => {
    const target = fakeWindow(fakeStorage({ 'fi-stale-chunk-reload': 'basura' }));
    expect(canReload(target, 1_000_000)).toBe(true);
  });

  it('shows the error instead of reloading when the storage is blocked', () => {
    const target = fakeWindow();
    Object.defineProperty(target, 'sessionStorage', {
      get() {
        throw new Error('blocked');
      },
    });
    reloadOnStaleChunk(target);
    const event = preloadError();
    target.dispatchEvent(event);
    expect(target.location.reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
