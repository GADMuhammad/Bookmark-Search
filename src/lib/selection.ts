export async function getSelectedText(): Promise<string> {
  if (typeof chrome === "undefined" || !chrome.tabs?.query || !chrome.scripting?.executeScript) {
    return ""
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  if (!activeTab?.id) return ""

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => window.getSelection()?.toString() ?? ""
    })
    return result?.result?.trim() ?? ""
  } catch {
    // Injection can fail on restricted pages (chrome://, the Web Store, etc).
    return ""
  }
}
