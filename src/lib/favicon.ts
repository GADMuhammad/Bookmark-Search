export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

// Uses the MV3 favicon API (requires the "favicon" permission) when
// running as a loaded extension; falls back to a public favicon service
// during plain-browser dev preview where chrome.runtime is unavailable.
export function getFaviconUrl(url: string): string {
  // If I have a problem with getting fivIcons, I'll simply remove this if condition and the "favicon" permission
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"))
    faviconUrl.searchParams.set("pageUrl", url)
    faviconUrl.searchParams.set("size", "32")
    return faviconUrl.toString()
  }
  return `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`
}
