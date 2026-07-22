const assetBaseUrl = (import.meta.env.VITE_ASSET_BASE_URL || '').replace(/\/$/, '');

export const assetUrl = (resourcePath) => {
    if (!resourcePath) return '';
    if (/^https?:\/\//i.test(resourcePath)) return resourcePath;
    return `${assetBaseUrl}${resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`}`;
};
