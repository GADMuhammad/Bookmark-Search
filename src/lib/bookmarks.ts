export interface Bookmark {
  id: string
  title: string
  url: string
  folderPath: string[]
}

// depth 0 = the invisible tree root; depth 1 = the browser's default root
// containers ("Bookmarks bar" / "Other bookmarks" / "Mobile bookmarks", or
// their localized equivalents). Every bookmark lives under one of those by
// definition, so their titles are excluded from the breadcrumb path — only
// real, user-created subfolders (depth 2+) are included.
function flatten(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  folderPath: string[] = [],
  depth = 0 // The Invisible Root
): Bookmark[] {
  const result: Bookmark[] = []

  for (const { id, url, title, children } of nodes) {
    if (url) result.push({ id, title: title || url, url, folderPath })

    if (children) {
      const isDefaultRootContainer: boolean = depth === 1 // depth 1 is the default bookmark root that contains (Bookmarks Bar, Other Bookmarks, Mobile Bookmarks)
      const childPath =
        title && !isDefaultRootContainer ? [...folderPath, title] : folderPath
      result.push(...flatten(children, childPath, depth + 1))
    }
  }

  return result
}

export async function loadBookmarks(): Promise<Bookmark[]> {
  if (typeof chrome !== "undefined" && chrome.bookmarks?.getTree) {
    const tree = await chrome.bookmarks.getTree()
    return flatten(tree)
  }
  return []
}

export async function deleteBookmark(id: string): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.bookmarks?.remove) {
    await chrome.bookmarks.remove(id)
  }
}

export async function updateBookmarkTitle(
  id: string,
  title: string
): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.bookmarks?.update) {
    await chrome.bookmarks.update(id, { title })
  }
}
