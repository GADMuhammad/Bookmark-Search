export interface Bookmark {
  id: string
  title: string
  url: string
  folderPath: string[]
}

function flatten(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  folderPath: string[] = []
): Bookmark[] {
  const result: Bookmark[] = []

  for (const node of nodes) {
    if (node.url) {
      result.push({
        id: node.id,
        title: node.title || node.url,
        url: node.url,
        folderPath
      })
    }
    if (node.children) {
      const childPath = node.title ? [...folderPath, node.title] : folderPath
      result.push(...flatten(node.children, childPath))
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
