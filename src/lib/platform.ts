export function isMac(): boolean {
  if (typeof navigator === "undefined") return false
  const platform =
    (navigator as any).userAgentData?.platform ?? navigator.platform ?? ""

  // return (platform as string).toLowerCase().includes("mac")
  return /mac/i.test(platform)
}

export function shortcutLabel(key: string): string {
  return isMac() ? `⌘${key}` : `Ctrl+${key}`
}

export function isShortcutModifierPressed(event: KeyboardEvent): boolean {
  // command on Mac, or ctrl on Windows
  return isMac() ? event.metaKey : event.ctrlKey
}

export function isArabicLocale(): boolean {
  if (typeof navigator === "undefined") return false
  return navigator.language?.toLowerCase().startsWith("ar")
}
