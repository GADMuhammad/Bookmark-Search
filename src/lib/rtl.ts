const ARABIC_RANGE = /[؀-ۿ]/

export function isRtl(title: string): boolean {
  return ARABIC_RANGE.test(title)
}
