import { useState } from "react"

import { FaviconFallbackIcon } from "./icons"
import { getDomain, getFaviconUrl } from "~/lib/favicon"
import { isRtl } from "~/lib/rtl"
import { openUrl } from "~/lib/tabs"
import type { Bookmark } from "~/mock/bookmarks"

interface BookmarkRowProps {
  bookmark: Bookmark
  shortcutLabel?: string
}

export function BookmarkRow({ bookmark, shortcutLabel }: BookmarkRowProps) {
  const [iconFailed, setIconFailed] = useState(false)

  const domain = getDomain(bookmark.url)
  const rtl = isRtl(bookmark.title)

  return (
    <a
      className="bm-row"
      href={bookmark.url}
      onClick={(event) => {
        event.preventDefault()
        openUrl(bookmark.url)
      }}>
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

      <span
        className={`bm-text-column ${rtl ? "bm-text-column--rtl" : "bm-text-column--ltr"}`}
        style={{ display: "flex", flexDirection: "column" }}>
        <span className="bm-title" dir="auto">
          {bookmark.title}
        </span>
        <span className="bm-domain" dir={rtl ? "rtl" : "ltr"}>
          {domain}
        </span>
      </span>

      {shortcutLabel && <span className="bm-badge">{shortcutLabel}</span>}
    </a>
  )
}
