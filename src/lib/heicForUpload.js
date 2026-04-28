export function fileExtensionLower(file) {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

/** True when the file is HEIC/HEIF by MIME or extension (extension helps when the browser leaves `type` empty). */
export function isHeicLikeFile(file) {
  const t = (file.type || '').toLowerCase();
  if (t === 'image/heic' || t === 'image/heif') return true;
  const ext = fileExtensionLower(file);
  return ext === 'heic' || ext === 'heif';
}

export function isAllowedPortfolioMedia(file) {
  if ((file.type || '').startsWith('image/')) return true;
  if (file.type === 'video/mp4' || file.type === 'video/webm') return true;
  if (isHeicLikeFile(file)) return true;
  return false;
}

/**
 * Converts HEIC/HEIF to JPEG for storage and `<img>` compatibility. Uses `heic-to` (current libheif);
 * `heic2any` often fails on newer iPhone photos with ERR_LIBHEIF format not supported.
 * Videos and non-HEIC images pass through unchanged.
 */
export async function ensureWebFriendlyImageOrPassThrough(file) {
  if ((file.type || '').startsWith('video/')) return file;
  if (!isHeicLikeFile(file)) return file;
  try {
    const { heicTo } = await import('heic-to');
    const blob = await heicTo({
      blob: file,
      type: 'image/jpeg',
      quality: 0.92,
    });
    if (!blob || !(blob instanceof Blob)) throw new Error('Empty conversion result');
    const stem = file.name.replace(/\.[^.]+$/i, '') || 'image';
    const safeStem = stem.replace(/[^\w.-]+/g, '_').slice(0, 120) || 'image';
    return new File([blob], `${safeStem}.jpg`, { type: 'image/jpeg' });
  } catch (e) {
    const msg = e?.message || String(e);
    throw new Error(
      `Could not convert this HEIC/HEIF image (${msg}). Try exporting as JPEG from your device, or pick another file.`,
    );
  }
}
