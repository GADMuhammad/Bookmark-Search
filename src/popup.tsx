import { useEffect, useMemo, useRef, useState } from "react"

import { BookmarkRow } from "~components/BookmarkRow"
import { GoogleFallbackRow } from "~components/GoogleFallbackRow"
import { SearchBar } from "~components/SearchBar"
import {
  deleteBookmark,
  loadBookmarks,
  updateBookmarkTitle,
  type Bookmark
} from "~lib/bookmarks"
import { getDomain } from "~lib/favicon"
import { bestFuzzyScore } from "~lib/fuzzy"
import { isShortcutModifierPressed, shortcutLabel } from "~lib/platform"
import { getSelectedText } from "~lib/selection"
import { openUrl } from "~lib/tabs"

import "~/style.scss"

const SHORTCUT_COUNT = 9

export default function popup() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [query, setQuery] = useState("")
  const [modifierHeld, setModifierHeld] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadBookmarks().then(setBookmarks)
  }, [])

  useEffect(() => {
    getSelectedText().then((selectedText) => {
      if (selectedText) setQuery(selectedText)
    })
  }, [])

  // ⌘E/Ctrl+E is a global browser command (see background.ts) — it never
  // reaches this page as a keydown, so while the popup is already open,
  // background.ts relays it here as a runtime message instead. Forward it to
  // whichever bookmark row is currently focused as a DOM event.
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.runtime?.onMessage) return

    function handleMessage(message: { type?: string }) {
      if (message?.type !== "edit-focused-bookmark") return
      const active = document.activeElement
      if (active instanceof HTMLElement && active.classList.contains("bm-row")) {
        active.dispatchEvent(new CustomEvent("bm:start-edit"))
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  async function handleDelete(bookmark: Bookmark) {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id))
    await deleteBookmark(bookmark.id)
  }

  async function handleRename(bookmark: Bookmark, title: string) {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === bookmark.id ? { ...b, title } : b))
    )
    await updateBookmarkTitle(bookmark.id, title)
  }

  // Tracks whether the shortcut modifier (⌘ on Mac, Ctrl elsewhere) is
  // currently held, so a hovered row can swap its delete button for an edit
  // button. Reset on blur so it can't get stuck "held" if the popup loses
  // focus (e.g. alt-tab) while the key is down and no keyup ever arrives.
  useEffect(() => {
    function handleModifierKey(event: KeyboardEvent) {
      setModifierHeld(isShortcutModifierPressed(event))
    }
    function resetModifier() {
      setModifierHeld(false)
    }
    window.addEventListener("keydown", handleModifierKey)
    window.addEventListener("keyup", handleModifierKey)
    window.addEventListener("blur", resetModifier)
    return () => {
      window.removeEventListener("keydown", handleModifierKey)
      window.removeEventListener("keyup", handleModifierKey)
      window.removeEventListener("blur", resetModifier)
    }
  }, [])

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
      // While renaming a bookmark, the row's own input owns all keyboard
      // input (typing, Backspace, arrow-key cursor movement, Enter/Escape) —
      // don't let the global shortcuts below hijack any of it.
      if (
        (document.activeElement as HTMLElement | null)?.classList.contains(
          "bm-edit-input"
        )
      ) {
        return
      }

      if (
        event.key === "Backspace" &&
        document.activeElement !== inputRef.current
      ) {
        event.preventDefault()
        inputRef.current?.focus()
        return
      }

      // navigation using up and down btns:
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>("input, a, button")
        ).filter((element) => element.tabIndex >= 0)

        if (!focusable.length) return

        event.preventDefault()
        const currentIndex = focusable.indexOf(
          document.activeElement as HTMLElement
        )
        const length = focusable.length
        const goingDown = event.key === "ArrowDown"

        let nextIndex: number
        if (currentIndex === -1) {
          nextIndex = goingDown ? 0 : length - 1
        } else if (goingDown) {
          nextIndex = (currentIndex + 1) % length
        } else {
          nextIndex = (currentIndex - 1 + length) % length
        }

        focusable[nextIndex]?.focus()
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
                modifierHeld={modifierHeld}
                onDelete={handleDelete}
                onRename={handleRename}
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
