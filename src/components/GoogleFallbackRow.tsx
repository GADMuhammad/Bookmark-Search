import { ArrowUpRightIcon, GoogleGIcon } from "./icons"

interface GoogleFallbackRowProps {
  query: string
  shortcutLabel: string
  disabled: boolean
  onOpen: () => void
}

export function GoogleFallbackRow({
  query,
  shortcutLabel,
  disabled,
  onOpen
}: GoogleFallbackRowProps) {
  return (
    <div className="bm-google-footer">
      <a
        className={`bm-google-row ${disabled ? "bm-google-row--disabled" : "bm-google-row--enabled"}`}
        href="#"
        aria-disabled={disabled}
        onClick={(event) => {
          event.preventDefault()
          if (!disabled) onOpen()
        }}>
        <span className="bm-google-accent" />
        <span className="bm-google-chip">
          <GoogleGIcon />
        </span>
        <span className="bm-google-label" dir="auto">
          Search Google for &quot;
          <span className="bm-google-query">
            {disabled ? "bookmarks" : query}
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
