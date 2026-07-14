const EMPTY_TAB_URLS = new Set([
  "chrome://newtab/",
  "chrome://new-tab-page/",
  "about:blank",
  "edge://newtab/"
])

const { tabs } = chrome

function isEmptyTab(tab: chrome.tabs.Tab | undefined): boolean {
  if (!tab?.url) return true
  return EMPTY_TAB_URLS.has(tab.url)
}

export async function openUrl(url: string): Promise<void> {
  if (
    typeof chrome !== "undefined" &&
    tabs?.query &&
    tabs?.create &&
    tabs?.update
  ) {
    const [activeTab] = await tabs.query({ active: true, currentWindow: true })

    if (activeTab?.id && isEmptyTab(activeTab)) {
      await tabs.update(activeTab.id, { url })
    } else await tabs.create({ url })

    window.close()
    return
  }
  window.open(url, "_blank", "noopener,noreferrer")
}
