import { describe, expect, it } from 'vitest';
import { embedSrc, parseVideoUrl } from './video.js';

// Mismos casos que backend/test/video.unit.test.js: las dos implementaciones deben coincidir
describe('parseVideoUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&t=5s', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=10', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['  https://youtu.be/dQw4w9WgXcQ  ', 'dQw4w9WgXcQ'],
  ])('recognizes the YouTube link %s', (value, videoId) => {
    expect(parseVideoUrl(value)).toEqual({
      provider: 'youtube', videoId, url: `https://www.youtube.com/watch?v=${videoId}`,
    });
  });

  it.each([
    ['https://vimeo.com/123456789', '123456789', undefined],
    ['https://www.vimeo.com/123456789', '123456789', undefined],
    ['https://player.vimeo.com/video/123456789', '123456789', undefined],
    ['https://vimeo.com/channels/staffpicks/123456789', '123456789', undefined],
    ['https://vimeo.com/123456789/abcdef1234', '123456789', 'abcdef1234'],
    ['https://player.vimeo.com/video/123456789?h=abcdef1234', '123456789', 'abcdef1234'],
  ])('recognizes the Vimeo link %s', (value, videoId, hash) => {
    const parsed = parseVideoUrl(value);
    expect(parsed).toMatchObject({ provider: 'vimeo', videoId });
    expect(parsed.hash).toBe(hash);
    expect(parsed.url).toBe(`https://vimeo.com/${videoId}${hash ? `/${hash}` : ''}`);
  });

  it.each([
    ['https://www.facebook.com/watch/?v=1234567890', 'https://www.facebook.com/watch/?v=1234567890'],
    ['https://www.facebook.com/watch?v=1234567890&extra=1', 'https://www.facebook.com/watch/?v=1234567890'],
    ['https://web.facebook.com/video.php?v=1234567890', 'https://www.facebook.com/watch/?v=1234567890'],
    ['https://www.facebook.com/undc.edu.pe/videos/1234567890', 'https://www.facebook.com/undc.edu.pe/videos/1234567890/'],
    ['https://www.facebook.com/undc/videos/mi-titulo/1234567890/', 'https://www.facebook.com/undc/videos/mi-titulo/1234567890/'],
    ['https://m.facebook.com/reel/1234567890', 'https://www.facebook.com/reel/1234567890/'],
  ])('recognizes the Facebook link %s', (value, canonical) => {
    expect(parseVideoUrl(value)).toEqual({ provider: 'facebook', url: canonical });
  });

  it.each([
    ['empty text', ''],
    ['not a URL', 'dQw4w9WgXcQ'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['data scheme', 'data:text/html,<script>alert(1)</script>'],
    ['lookalike YouTube host', 'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'],
    ['lookalike prefix host', 'https://evilyoutube.com/watch?v=dQw4w9WgXcQ'],
    ['unrelated host', 'https://evil.example/watch?v=dQw4w9WgXcQ'],
    ['local address', 'http://127.0.0.1/watch?v=dQw4w9WgXcQ'],
    ['short YouTube id', 'https://www.youtube.com/watch?v=short'],
    ['YouTube id with symbols', 'https://www.youtube.com/watch?v=dQw4w9WgXc<'],
    ['YouTube channel page', 'https://www.youtube.com/@undc'],
    ['Vimeo without id', 'https://vimeo.com/channels/staffpicks'],
    ['Vimeo with letters in the id', 'https://vimeo.com/12345abc'],
    ['Facebook short link', 'https://fb.watch/abcDEF123/'],
    ['Facebook share link', 'https://www.facebook.com/share/v/abc123/'],
    ['Facebook profile', 'https://www.facebook.com/undc.edu.pe'],
    ['lookalike Facebook host', 'https://facebook.com.evil.com/watch/?v=1234567890'],
  ])('rejects %s', (label, value) => {
    expect(parseVideoUrl(value)).toBeNull();
  });
});

describe('embedSrc', () => {
  it('builds the player URL for each provider', () => {
    expect(embedSrc({ provider: 'youtube', videoId: 'dQw4w9WgXcQ' }))
      .toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(embedSrc({ provider: 'vimeo', videoId: '123456789', hash: 'abcdef1234' }))
      .toBe('https://player.vimeo.com/video/123456789?h=abcdef1234');
    expect(embedSrc({ provider: 'vimeo', videoId: '123456789' })).toBe('https://player.vimeo.com/video/123456789');
    expect(embedSrc({ provider: 'facebook', url: 'https://www.facebook.com/undc/videos/1234567890/' }))
      .toBe('https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fundc%2Fvideos%2F1234567890%2F&show_text=false');
  });

  it('refuses data that does not look like a stored video', () => {
    expect(embedSrc(null)).toBeNull();
    expect(embedSrc({ provider: 'youtube', videoId: '"><script>' })).toBeNull();
    expect(embedSrc({ provider: 'vimeo', videoId: 'abc' })).toBeNull();
    expect(embedSrc({ provider: 'facebook', url: 'https://evil.example/x' })).toBeNull();
    expect(embedSrc({ provider: 'dailymotion', videoId: 'x7tgad0' })).toBeNull();
  });
});
