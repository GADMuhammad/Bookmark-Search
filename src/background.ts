// Ctrl+E/Cmd+E is a global browser command, so pressing it never reaches the
// popup's own page JS as a keydown — the browser intercepts it and only
// notifies us here, regardless of whether the popup is already open.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-popup") return

  const popups = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.POPUP]
  })

  if (popups.length > 0) {
    // Popup is already open with a bookmark row focused — edit it in place
    // instead of re-triggering openPopup(), which no-ops while it's open.
    chrome.runtime
      .sendMessage({ type: "edit-focused-bookmark" })
      .catch(() => {})
  } else chrome.action.openPopup()
})
