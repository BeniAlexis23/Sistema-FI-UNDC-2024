/* Reconoce enlaces de video de YouTube, Vimeo y Facebook y arma la URL del reproductor.
   Espejo de backend/src/libs/video.js: ambos deben pasar los mismos casos de prueba.
   Los hosts se comparan de forma exacta para rechazar dominios parecidos (youtube.com.evil.com). */

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
const FACEBOOK_HOSTS = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com']);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
const VIMEO_HASH = /^[a-f0-9]{8,16}$/i;
const FACEBOOK_ID = /^\d{6,20}$/;
const FACEBOOK_PAGE_VIDEO = /^\/[A-Za-z0-9._-]+\/videos\/(?:[A-Za-z0-9._%-]+\/)?\d{6,20}$/;
const FACEBOOK_REEL = /^\/reel\/\d{6,20}$/;

const toUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
};

const fromYoutube = (url) => {
  let videoId = null;
  if (url.hostname === 'youtu.be') {
    videoId = url.pathname.split('/')[1];
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    const [, first, second] = url.pathname.split('/');
    if (first === 'watch') videoId = url.searchParams.get('v');
    else if (['embed', 'shorts', 'live', 'v'].includes(first)) videoId = second;
  }
  if (!YOUTUBE_ID.test(videoId ?? '')) return null;
  return { provider: 'youtube', videoId, url: `https://www.youtube.com/watch?v=${videoId}` };
};

const fromVimeo = (url) => {
  if (!VIMEO_HOSTS.has(url.hostname)) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  const idIndex = segments.findIndex((segment) => VIMEO_ID.test(segment));
  if (idIndex === -1) return null;

  const videoId = segments[idIndex];
  const candidate = url.searchParams.get('h') ?? segments[idIndex + 1] ?? '';
  const hash = VIMEO_HASH.test(candidate) ? candidate : null;
  return { provider: 'vimeo', videoId, ...(hash && { hash }), url: `https://vimeo.com/${videoId}${hash ? `/${hash}` : ''}` };
};

const fromFacebook = (url) => {
  if (!FACEBOOK_HOSTS.has(url.hostname)) return null;
  const path = url.pathname.replace(/\/+$/, '');
  const watchId = path === '/watch' || path === '/video.php' ? url.searchParams.get('v') : null;

  let canonical = null;
  if (FACEBOOK_ID.test(watchId ?? '')) canonical = `/watch/?v=${watchId}`;
  else if (FACEBOOK_PAGE_VIDEO.test(path) || FACEBOOK_REEL.test(path)) canonical = `${path}/`;
  return canonical ? { provider: 'facebook', url: `https://www.facebook.com${canonical}` } : null;
};

export const parseVideoUrl = (value) => {
  const url = toUrl(value);
  if (!url) return null;
  return fromYoutube(url) ?? fromVimeo(url) ?? fromFacebook(url);
};

/* URL del reproductor para un bloque ya guardado; null si los datos no son válidos */
export const embedSrc = (block) => {
  if (block?.provider === 'youtube' && YOUTUBE_ID.test(block.videoId ?? '')) {
    return `https://www.youtube-nocookie.com/embed/${block.videoId}`;
  }
  if (block?.provider === 'vimeo' && VIMEO_ID.test(block.videoId ?? '')) {
    const hash = VIMEO_HASH.test(block.hash ?? '') ? `?h=${block.hash}` : '';
    return `https://player.vimeo.com/video/${block.videoId}${hash}`;
  }
  if (block?.provider === 'facebook') {
    const video = parseVideoUrl(block.url);
    if (video?.provider === 'facebook') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.url)}&show_text=false`;
    }
  }
  return null;
};

export const providerLabel = { youtube: 'YouTube', vimeo: 'Vimeo', facebook: 'Facebook' };
