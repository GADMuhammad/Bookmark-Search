import { useEffect, useMemo, useRef, useState } from "react"

import { loadBookmarks } from "~/lib/bookmarks"
import { getDomain } from "~/lib/favicon"
import { isShortcutModifierPressed, shortcutLabel } from "~/lib/platform"
import { openUrl } from "~/lib/tabs"
import type { Bookmark } from "~/mock/bookmarks"

import { BookmarkRow } from "./BookmarkRow"
import { GoogleFallbackRow } from "./GoogleFallbackRow"
import { SearchBar } from "./SearchBar"

const SHORTCUT_COUNT = 9

export function Popup() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadBookmarks().then(setBookmarks)
  }, [])

  const trimmedQuery = query.trim().toLowerCase()
  const hasQuery = trimmedQuery.length > 0

  const filtered = useMemo(() => {
    if (!hasQuery) return bookmarks
    return bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(trimmedQuery) ||
        getDomain(bookmark.url).toLowerCase().includes(trimmedQuery)
    )
  }, [bookmarks, trimmedQuery, hasQuery])

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isShortcutModifierPressed(event) || event.shiftKey || event.altKey) {
        return
      }

      if (/^[1-9]$/.test(event.key)) {
        const target = filtered[Number(event.key) - 1]
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
      {/* <div className="bm-glow bm-glow--one" /> */}
      {/* <div className="bm-glow bm-glow--two" /> */}

      <div className="bm-card">
        <div className="bm-header">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            inputRef={inputRef}
          />
        </div>

        <div className="bm-results">
          {filtered.length > 0 ? (
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
            <div className="bm-empty-state">No bookmarks match</div>
          )}
        </div>

        <GoogleFallbackRow
          query={query.trim()}
          shortcutLabel={shortcutLabel("G")}
          disabled={!hasQuery}
          onOpen={() => openUrl(googleSearchUrl)}
        />
      </div>
    </div>
  )
}
