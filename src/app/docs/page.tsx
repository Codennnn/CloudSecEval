import { redirect } from 'next/navigation'

import { RoutePath } from '~/constants'
import { navMainData } from '~/lib/data/nav'

export default function DocsIndexPage() {
  // 遍历导航数据查找第一个有效的 URL
  let firstValidUrl = '/introduction' // 默认值

  for (const item of navMainData) {
    // 检查项目是否有有效的 URL (不是 '#')
    if (item.url && item.url !== '#') {
      firstValidUrl = item.url
      break
    }

    // 如果主项目没有有效 URL，检查其子项目
    if (item.items && item.items.length > 0) {
      for (const subItem of item.items) {
        if (subItem.url && subItem.url !== '#') {
          firstValidUrl = subItem.url
          break
        }
      }

      if (firstValidUrl !== '/introduction') {
        break // 如果在子项目中找到有效 URL，跳出外层循环
      }
    }
  }

  redirect(`${RoutePath.Docs}${firstValidUrl}`)
}
