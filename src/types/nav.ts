export interface NavItem {
  title?: string
  url?: string
}

export interface NavSection {
  title?: string
  url?: string
  items?: NavItem[]
}
