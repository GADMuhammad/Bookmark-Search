import { useState } from "react"

import type { Bookmark } from "~/lib/bookmarks"
import { getDomain, getFaviconUrl } from "~/lib/favicon"
import { isArabicLocale } from "~/lib/platform"
import { isRtl } from "~/lib/rtl"
import { openUrl } from "~/lib/tabs"

import { ClearIcon, FaviconFallbackIcon } from "./icons"

interface BookmarkRowProps {
  bookmark: Bookmark
  shortcutLabel?: string
  onDelete: (bookmark: Bookmark) => void
}

function deleteConfirmMessage(title: string): string {
  return isArabicLocale()
    ? `هل تريد حذف "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`
    : `Delete "${title}"? This can't be undone.`
}

export function BookmarkRow({
  bookmark,
  shortcutLabel,
  onDelete
}: BookmarkRowProps) {
  const [iconFailed, setIconFailed] = useState(false)

  const domain = getDomain(bookmark.url)
  const rtl = isRtl(bookmark.title)
  // to get the last folder in the path, NOT all the path.
  // for example if we have a google bookmark in path: (folder1 >> folder2 >> google.com)
  // we only need (folder2 • google.com)
  const immediateFolder = bookmark.folderPath.at(-1)
  const subtitle = immediateFolder ? `${immediateFolder} • ${domain}` : domain

  function handleDeleteClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (window.confirm(deleteConfirmMessage(bookmark.title))) {
      onDelete(bookmark)
    }
  }

  return (
    <a
      className="bm-row"
      href={bookmark.url}
      onClick={(event) => {
        event.preventDefault()
        openUrl(bookmark.url)
      }}>
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
          onClick={handleDeleteClick}>
          <ClearIcon />
        </button>
      </span>

      <span
        className={`bm-text-column ${rtl ? "bm-text-column--rtl" : "bm-text-column--ltr"}`}
        style={{ display: "flex", flexDirection: "column" }}>
        <span className="bm-title" dir="auto">
          {bookmark.title}
        </span>
        <span className="bm-domain" dir={rtl ? "rtl" : "ltr"}>
          {subtitle}
        </span>
      </span>

      {shortcutLabel && <span className="bm-badge">{shortcutLabel}</span>}
    </a>
  )
}
