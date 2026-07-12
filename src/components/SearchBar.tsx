import { ClearIcon, SearchIcon } from "./icons"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  inputRef?: React.RefObject<HTMLInputElement>
}

export function SearchBar({
  value,
  onChange,
  onClear,
  inputRef
}: SearchBarProps) {
  return (
    <div className="bm-search-bar">
      <span className="bm-search-icon">
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        className="bm-search-input"
        type="text"
        placeholder="Search bookmarks..."
        dir="auto"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="bm-clear-btn"
          aria-label="Clear search"
          onClick={onClear}>
          <ClearIcon />
        </button>
      )}
    </div>
  )
}
