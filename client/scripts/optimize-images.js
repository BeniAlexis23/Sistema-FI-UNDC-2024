import { readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const assetsDirectory = path.resolve('src', 'assets');
const supportedImage = /\.(webp|png|jpe?g)$/i;
let optimized = 0;
let bytesSaved = 0;

for (const filename of await readdir(assetsDirectory)) {
    if (!supportedImage.test(filename)) continue;
    const filepath = path.join(assetsDirectory, filename);
    const input = await readFile(filepath);
    const metadata = await sharp(input).metadata();
    if ((metadata.width || 0) <= 1920 && (metadata.height || 0) <= 1920) continue;

    const originalSize = (await stat(filepath)).size;
    const output = await sharp(input)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();
    await writeFile(filepath, output);
    optimized += 1;
    bytesSaved += originalSize - output.length;
}

console.log(`Optimized ${optimized} image(s); saved ${bytesSaved} bytes.`);
