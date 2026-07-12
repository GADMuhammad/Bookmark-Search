export function isMac(): boolean {
  if (typeof navigator === "undefined") return false
  const platform =
    (navigator as any).userAgentData?.platform ?? navigator.platform ?? ""
  return /mac/i.test(platform)
}

export function shortcutLabel(key: string): string {
  return isMac() ? `⌘${key}` : `Ctrl+${key}`
}

export function isShortcutModifierPressed(event: KeyboardEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey
}
