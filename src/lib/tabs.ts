export function openUrl(url: string): void {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url })
    window.close()
    return
  }
  window.open(url, "_blank", "noopener,noreferrer")
}
