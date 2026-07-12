export interface Bookmark {
  id: string
  title: string
  url: string
}

// Placeholder data for the UI pass. Replaced by chrome.bookmarks.* in the
// functionality pass.
export const BOOKMARKS: Bookmark[] = [
  {
    id: "1",
    title: "GitHub – Pull Requests",
    url: "https://github.com/pulls"
  },
  {
    id: "2",
    title: "مطعم الديرة – قائمة الطعام",
    url: "https://aldeera-menu.example.com"
  },
  {
    id: "3",
    title: "Figma – Nocturne Design System",
    url: "https://figma.com/file/nocturne"
  },
  {
    id: "4",
    title: "أخبار الرياض اليوم",
    url: "https://riyadh-news.example.com"
  },
  {
    id: "5",
    title: "MDN Web Docs – CSS Grid",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"
  },
  {
    id: "6",
    title: "متجر التقنية الحديثة",
    url: "https://tech-store.example.com"
  },
  {
    id: "7",
    title: "Stack Overflow – React hooks",
    url: "https://stackoverflow.com/questions/tagged/react-hooks"
  }
]
