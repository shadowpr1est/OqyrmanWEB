/**
 * Rewrites a MinIO public URL into an imgproxy URL for on-the-fly resizing
 * and automatic WebP/AVIF conversion.
 *
 *  Input:  https://api.oqyrman.app/minio/oqyrman/covers/abc.jpg
 *  Output: https://api.oqyrman.app/img/unsafe/rs:fit:300:0/plain/http://minio:9000/oqyrman/covers/abc.jpg
 *
 * Falls back to the original URL in development or for non-MinIO sources.
 */

const MINIO_PUBLIC_PREFIX = "https://api.oqyrman.app/minio";
const MINIO_INTERNAL = "http://minio:9000";
const IMGPROXY_BASE = "https://api.oqyrman.app/img";

const isDev = import.meta.env.DEV;

/**
 * Build an optimized image URL via imgproxy.
 * @param url    Original MinIO public URL stored in the DB
 * @param width  Desired width in px (height auto-calculated to preserve ratio)
 * @param quality JPEG/WebP quality 1-100 (default 80)
 */
export function optimizedUrl(
  url: string | undefined | null,
  width: number,
  quality = 80,
): string {
  if (!url) return "";

  // In dev mode or for non-MinIO URLs, return as-is
  if (isDev || !url.startsWith(MINIO_PUBLIC_PREFIX)) return url;

  // Rewrite public URL to internal MinIO URL for imgproxy
  const internalPath = url.replace(MINIO_PUBLIC_PREFIX, MINIO_INTERNAL);

  return `${IMGPROXY_BASE}/unsafe/rs:fit:${width}:0/q:${quality}/plain/${internalPath}`;
}
