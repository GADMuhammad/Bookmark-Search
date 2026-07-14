import { ArrowUpRightIcon, GoogleGIcon } from "./icons"

interface GoogleFallbackRowProps {
  query: string
  shortcutLabel: string
  hasQuery: boolean
  onOpen: () => void
}

export function GoogleFallbackRow({
  query,
  shortcutLabel,
  hasQuery,
  onOpen
}: GoogleFallbackRowProps) {
  return (
    <div className="bm-google-footer">
      <a
        tabIndex={hasQuery ? undefined : -1}
        className={`bm-google-row ${hasQuery ? "bm-google-row--enabled" : "bm-google-row--disabled"}`}
        href="#"
        aria-disabled={!hasQuery}
        onClick={(event) => {
          event.preventDefault()
          if (hasQuery) onOpen()
        }}>
        <span className="bm-google-accent" />
        <span className="bm-google-chip">
          <GoogleGIcon />
        </span>
        <span className="bm-google-label" dir="auto">
          Search Google for &quot;
          <span className="bm-google-query">
            {hasQuery ? query : "bookmarks"}
          </span>
          &quot;
        </span>
        <span className="bm-badge">{shortcutLabel}</span>
        <span className="bm-google-arrow">
          <ArrowUpRightIcon />
        </span>
      </a>
    </div>
  )
}
