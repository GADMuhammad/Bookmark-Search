import { useEffect, useRef, useState } from "react"

import type { Bookmark } from "~/lib/bookmarks"
import { getDomain, getFaviconUrl } from "~/lib/favicon"
import { isArabicLocale, isShortcutModifierPressed } from "~/lib/platform"
import { isRtl } from "~/lib/rtl"
import { openUrl } from "~/lib/tabs"

import { ClearIcon, EditIcon, FaviconFallbackIcon } from "./icons"

interface BookmarkRowProps {
  bookmark: Bookmark
  shortcutLabel?: string
  modifierHeld?: boolean
  onDelete: (bookmark: Bookmark) => void
  onRename: (bookmark: Bookmark, title: string) => void
}

function deleteConfirmMessage(title: string): string {
  return isArabicLocale()
    ? `هل تريد حذف "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`
    : `Delete "${title}"? This can't be undone.`
}

// window.confirm() blocks the event loop, which can leave the element the
// user interacted with stuck in :hover (Chrome/WebKit won't re-evaluate it
// until the next real mouse move). Toggling pointer-events forces an
// immediate re-check, so the hover state clears as soon as the dialog closes.
function clearStaleHover(element: HTMLElement) {
  element.blur()
  document.body.style.pointerEvents = "none"
  requestAnimationFrame(() => {
    document.body.style.pointerEvents = ""
  })
}

export function BookmarkRow({
  bookmark,
  shortcutLabel,
  modifierHeld,
  onDelete,
  onRename
}: BookmarkRowProps) {
  const [iconFailed, setIconFailed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(bookmark.title)
  const editInputRef = useRef<HTMLInputElement>(null)
  // Guards against the blur fired by React unmounting the input right after
  // Enter/Escape already resolved the edit, so that unmount-blur doesn't
  // re-run the discard path on top of an already-committed/-cancelled edit.
  const isClosingRef = useRef(false)

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [isEditing])

  const domain = getDomain(bookmark.url)
  const rtl = isRtl(bookmark.title)
  // to get the last folder in the path, NOT all the path.
  // for example if we have a google bookmark in path: (folder1 >> folder2 >> google.com)
  // we only need (folder2 • google.com)
  const immediateFolder = bookmark.folderPath.at(-1)
  const subtitle = immediateFolder ? `${immediateFolder} • ${domain}` : domain

  function performDelete(triggerElement: HTMLElement) {
    const confirmed = window.confirm(deleteConfirmMessage(bookmark.title))
    // confirm() returns focus to the trigger element, which keeps the delete
    // icon visible via :focus-within — blur so it reverts once the mouse
    // isn't actually hovering it anymore (e.g. after cancelling).
    clearStaleHover(triggerElement)
    if (confirmed) onDelete(bookmark)
  }

  function handleDeleteClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    performDelete(event.currentTarget)
  }

  function handleRowKeyDown(event: React.KeyboardEvent<HTMLAnchorElement>) {
    if (
      isShortcutModifierPressed(event.nativeEvent) &&
      !event.shiftKey &&
      !event.altKey &&
      event.key.toLowerCase() === "d"
    ) {
      event.preventDefault()
      performDelete(event.currentTarget)
    }
  }

  function handleEditClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setEditValue(bookmark.title)
    setIsEditing(true)
  }

  function commitEdit() {
    isClosingRef.current = true
    setIsEditing(false)
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== bookmark.title) onRename(bookmark, trimmed)
  }

  function cancelEdit() {
    isClosingRef.current = true
    setIsEditing(false)
    setEditValue(bookmark.title)
  }

  function handleEditInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // Editing owns all keyboard input while active, so it never leaks up to
    // the row's own shortcut (⌘D) or the popup's global shortcut handler.
    event.stopPropagation()
    if (event.key === "Enter") {
      event.preventDefault()
      commitEdit()
    } else if (event.key === "Escape") {
      event.preventDefault()
      cancelEdit()
    }
  }

  function handleEditInputBlur() {
    // Skip the discard if this blur was caused by Enter/Escape unmounting
    // the input (already handled); otherwise clicking away discards.
    if (isClosingRef.current) {
      isClosingRef.current = false
      return
    }
    cancelEdit()
  }

  return (
    <a
      className={`bm-row${modifierHeld ? " bm-row--modifier-held" : ""}${isEditing ? " bm-row--editing" : ""}`}
      href={bookmark.url}
      onClick={(event) => {
        event.preventDefault()
        if (isEditing) return
        openUrl(bookmark.url)
      }}
      onKeyDown={handleRowKeyDown}>
      <span className="bm-favicon-slot">
        <span
          className={`bm-favicon-chip${iconFailed ? " bm-favicon-chip--fallback" : ""}`}>
          {iconFailed ? (
            <FaviconFallbackIcon />
          ) : (
            <img
              className="bm-favicon-img"
              src={getFaviconUrl(bookmark.url)}
              alt=""
              onError={() => setIconFailed(true)}
            />
          )}
        </span>

        <button
          type="button"
          className="bm-delete-btn"
          aria-label={`Delete "${bookmark.title}"`}
          onClick={handleDeleteClick}
          tabIndex={-1}>
          <ClearIcon />
        </button>

        <button
          type="button"
          className="bm-edit-btn"
          aria-label={`Edit "${bookmark.title}"`}
          onClick={handleEditClick}
          tabIndex={-1}>
          <EditIcon />
        </button>
      </span>

      <span
        className={`bm-text-column ${rtl ? "bm-text-column--rtl" : "bm-text-column--ltr"}`}
        style={{ display: "flex", flexDirection: "column" }}>
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            className="bm-edit-input"
            value={editValue}
            dir="auto"
            onChange={(event) => setEditValue(event.target.value)}
            onKeyDown={handleEditInputKeyDown}
            onBlur={handleEditInputBlur}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <span className="bm-title" dir="auto">
            {bookmark.title}
          </span>
        )}
        <span className="bm-domain" dir={rtl ? "rtl" : "ltr"}>
          {subtitle}
        </span>
      </span>

      {shortcutLabel && <span className="bm-badge">{shortcutLabel}</span>}
    </a>
  )
}
