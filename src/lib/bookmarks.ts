import { BOOKMARKS, type Bookmark } from "~/mock/bookmarks"

function flatten(nodes: chrome.bookmarks.BookmarkTreeNode[]): Bookmark[] {
  const result: Bookmark[] = []

  for (const node of nodes) {
    if (node.url) {
      result.push({ id: node.id, title: node.title || node.url, url: node.url })
    }
    if (node.children) {
      result.push(...flatten(node.children))
    }
  }

  return result
}

// Reads the user's real bookmarks when running as a loaded extension;
// falls back to mock data during plain-browser dev preview.
export async function loadBookmarks(): Promise<Bookmark[]> {
  if (typeof chrome !== "undefined" && chrome.bookmarks?.getTree) {
    const tree = await chrome.bookmarks.getTree()
    return flatten(tree)
  }
  return BOOKMARKS
}
