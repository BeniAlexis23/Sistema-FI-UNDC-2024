import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
const appOrigin = process.env.APP_ORIGIN || (isProduction ? undefined : 'http://localhost:5173');
const databaseUri = isProduction
    ? process.env.MONGODB_URI
    : process.env.MONGODB_LOCAL || process.env.MONGODB_URI;
const port = Number(process.env.PORT || 3000);
const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 25);

if (!jwtSecret || jwtSecret.trim().length < 32) {
    throw new Error('JWT_SECRET is required and must contain at least 32 characters');
}

if (!appOrigin) {
    throw new Error('APP_ORIGIN is required in production');
}

if (!databaseUri) {
    throw new Error(isProduction ? 'MONGODB_URI is required in production' : 'MONGODB_LOCAL or MONGODB_URI is required');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
}

if (!Number.isFinite(maxUploadSizeMb) || maxUploadSizeMb <= 0 || maxUploadSizeMb > 50) {
    throw new Error('MAX_UPLOAD_SIZE_MB must be greater than 0 and at most 50');
}

let normalizedOrigin;
let originHostname;
try {
    const parsedOrigin = new URL(appOrigin);
    if (!['http:', 'https:'].includes(parsedOrigin.protocol)) throw new Error();
    normalizedOrigin = parsedOrigin.origin;
    originHostname = parsedOrigin.hostname;
} catch {
    throw new Error('APP_ORIGIN must be a valid HTTP or HTTPS origin');
}

const cookieSecure = process.env.COOKIE_SECURE === undefined
    ? isProduction
    : process.env.COOKIE_SECURE === 'true';
if (isProduction && !cookieSecure && !['localhost', '127.0.0.1'].includes(originHostname)) {
    throw new Error('COOKIE_SECURE can only be disabled for local production testing');
}

export const JWT_SECRET = jwtSecret;
export const APP_ORIGIN = normalizedOrigin;
export const IS_PRODUCTION = isProduction;
export const DATABASE_URI = databaseUri;
export const PORT = port;
export const UPLOAD_DIR = process.env.UPLOAD_DIR;
export const MAX_UPLOAD_BYTES = maxUploadSizeMb * 1024 * 1024;
export const TOKEN_TTL = '1d';
export const TOKEN_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

export const tokenCookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_COOKIE_MAX_AGE
};

export const tokenCookieClearOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'strict',
    path: '/'
};
