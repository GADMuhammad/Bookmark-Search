import { useEffect, useMemo, useRef, useState } from "react"

import { BookmarkRow } from "~components/BookmarkRow"
import { GoogleFallbackRow } from "~components/GoogleFallbackRow"
import { SearchBar } from "~components/SearchBar"
import { deleteBookmark, loadBookmarks, type Bookmark } from "~lib/bookmarks"
import { getDomain } from "~lib/favicon"
import { bestFuzzyScore } from "~lib/fuzzy"
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

  async function handleDelete(bookmark: Bookmark) {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id))
    await deleteBookmark(bookmark.id)
  }

  const trimmedQuery: string = query.trim().toLowerCase()
  const hasQuery: boolean = trimmedQuery.length > 0

  const filteredBookmarks: Bookmark[] = useMemo(() => {
    if (!hasQuery) return bookmarks

    return bookmarks
      .map((bookmark: Bookmark) => ({
        bookmark,
        score: bestFuzzyScore(
          [
            bookmark.title,
            getDomain(bookmark.url),
            bookmark.folderPath.join(" ")
          ],
          trimmedQuery
        )
      }))
      .filter(
        (entry): entry is { bookmark: Bookmark; score: number } =>
          entry.score !== null
      )
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.bookmark)
  }, [bookmarks, trimmedQuery, hasQuery])

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`
  const googleShortcut = shortcutLabel("G")

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && hasQuery) {
      event.preventDefault()
      openUrl(googleSearchUrl)
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Backspace" &&
        document.activeElement !== inputRef.current
      ) {
        event.preventDefault()
        inputRef.current?.focus()
        return
      }

      if (!isShortcutModifierPressed(event) || event.shiftKey || event.altKey) {
        return
      }

      if (/^[1-9]$/.test(event.key)) {
        const target: Bookmark = filteredBookmarks[Number(event.key) - 1]
        if (target) {
          event.preventDefault()
          openUrl(target.url)
        }
        return
      }

      if (hasQuery && event.key.toLowerCase() === "g") {
        event.preventDefault()
        openUrl(googleSearchUrl)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [filteredBookmarks, hasQuery, googleSearchUrl])

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
                ? `Search ${bookmarks.length} Bookmark${bookmarks.length > 1 ? "s" : ""} or Google...`
                : "Search Google..."
            }
          />
        </div>

        <div className="bm-results">
          {filteredBookmarks.length ? (
            filteredBookmarks.map((bookmark, index) => (
              <BookmarkRow
                key={bookmark.id}
                bookmark={bookmark}
                shortcutLabel={
                  index < SHORTCUT_COUNT
                    ? shortcutLabel(String(index + 1))
                    : undefined
                }
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="bm-empty-state">
              <p>No bookmarks match.</p>
              {trimmedQuery && (
                <p className="bm-empty-state-hint">
                  Press <span className="bm-empty-state-badge">Enter</span> or{" "}
                  <span className="bm-empty-state-badge">{googleShortcut}</span>{" "}
                  to search Google instead.
                </p>
              )}
            </div>
          )}
        </div>

        <GoogleFallbackRow
          query={query.trim()}
          shortcutLabel={googleShortcut}
          hasQuery={hasQuery}
          onOpen={() => openUrl(googleSearchUrl)}
        />
      </div>
    </div>
  )
}
