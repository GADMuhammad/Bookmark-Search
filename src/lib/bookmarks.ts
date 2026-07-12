export interface Bookmark {
  id: string
  title: string
  url: string
  folder?: string
}

function flatten(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  parentFolder?: string
): Bookmark[] {
  const result: Bookmark[] = []

  for (const node of nodes) {
    if (node.url) {
      result.push({
        id: node.id,
        title: node.title || node.url,
        url: node.url,
        folder: parentFolder
      })
    }
    if (node.children) {
      result.push(...flatten(node.children, node.title))
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
