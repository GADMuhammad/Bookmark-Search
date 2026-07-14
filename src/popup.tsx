import { useEffect, useMemo, useRef, useState } from "react"

import { BookmarkRow } from "~components/BookmarkRow"
import { GoogleFallbackRow } from "~components/GoogleFallbackRow"
import { SearchBar } from "~components/SearchBar"
import { loadBookmarks, type Bookmark } from "~lib/bookmarks"
import { getDomain } from "~lib/favicon"
import { isShortcutModifierPressed, shortcutLabel } from "~lib/platform"
import { openUrl } from "~lib/tabs"

import "~/style.scss"

const SHORTCUT_COUNT = 9

export default function popup() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadBookmarks().then(setBookmarks)
  }, [])

  const trimmedQuery: string = query.trim().toLowerCase()
  const hasQuery: boolean = !!trimmedQuery.length

  const filtered: Bookmark[] = useMemo(() => {
    if (!hasQuery) return bookmarks
    return bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(trimmedQuery) ||
        getDomain(bookmark.url).toLowerCase().includes(trimmedQuery) ||
        bookmark.folderPath.join(" ").toLowerCase().includes(trimmedQuery)
    )
  }, [bookmarks, trimmedQuery, hasQuery])

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && hasQuery) {
      event.preventDefault()
      openUrl(googleSearchUrl)
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isShortcutModifierPressed(event) || event.shiftKey || event.altKey) {
        return
      }

      if (/^[1-9]$/.test(event.key)) {
        const target: Bookmark = filtered[Number(event.key) - 1]
        if (target) {
          event.preventDefault()
          openUrl(target.url)
        }
        return
      }

      if (event.key.toLowerCase() === "g" && hasQuery) {
        event.preventDefault()
        openUrl(googleSearchUrl)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [filtered, hasQuery, googleSearchUrl])

  return (
    <div className="bm-stage">
      <div className="bm-glow bm-glow--one" />
      <div className="bm-glow bm-glow--two" />

      <div className="bm-card">
        <div className="bm-header">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            onKeyDown={handleInputKeyDown}
            inputRef={inputRef}
            placeholder={
              bookmarks.length
                ? `Search ${bookmarks.length} bookmark${bookmarks.length > 1 ? "s" : ""} or google...`
                : "Search Google..."
            }
          />
        </div>

        <div className="bm-results">
          {filtered.length ? (
            filtered.map((bookmark, index) => (
              <BookmarkRow
                key={bookmark.id}
                bookmark={bookmark}
                shortcutLabel={
                  index < SHORTCUT_COUNT
                    ? shortcutLabel(String(index + 1))
                    : undefined
                }
              />
            ))
          ) : (
            <div className="bm-empty-state">
              {`No bookmarks match. ${trimmedQuery ? "Press Enter after typing to search on Google." : ""}`}
            </div>
          )}
        </div>

        <GoogleFallbackRow
          query={query.trim()}
          shortcutLabel={shortcutLabel("G")}
          hasQuery={hasQuery}
          hasQuery={hasQuery}
          onOpen={() => openUrl(googleSearchUrl)}
        />
      </div>
    </div>
  )
}
