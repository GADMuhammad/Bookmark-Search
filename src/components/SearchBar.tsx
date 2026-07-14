import { ClearIcon, SearchIcon } from "./icons"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef?: React.RefObject<HTMLInputElement>
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  onClear,
  onKeyDown,
  inputRef,
  placeholder
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
        placeholder={placeholder ?? "Search bookmarks or google..."}
        dir="auto"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {value.length > 0 && (
        <button
          tabIndex={-1} // to remove it from the order of movement when using (tab) button
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
