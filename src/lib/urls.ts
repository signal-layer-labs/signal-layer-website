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

export function isValidExternalUrl(url: string | null | undefined) {
  const normalizedUrl = normalizeExternalUrl(url);

  if (!normalizedUrl) {
    return true;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    return ["http:", "https:"].includes(parsedUrl.protocol) && Boolean(parsedUrl.hostname);
  } catch {
    return false;
  }
}
