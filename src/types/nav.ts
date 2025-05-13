export interface NavItem {
  title: string
  url: string
  isActive?: boolean
}

export interface NavSection {
  title: string
  url: string
  items?: NavItem[]
}
