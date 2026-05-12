export function normalizeExternalUrl(url: string | null | undefined) {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}
