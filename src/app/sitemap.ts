import type { MetadataRoute } from 'next'

import { getDocsUrl, getFullUrl } from '~/constants'
import { getAllDocPaths } from '~/utils/docs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()

  // 基础页面
  const basePages: MetadataRoute.Sitemap = [
    {
      url: getFullUrl(),
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: getDocsUrl(),
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  try {
    // 获取所有文档路径
    const docPaths = await getAllDocPaths()

    // 生成文档页面的 sitemap 条目
    const docPages: MetadataRoute.Sitemap = docPaths.map((docPath) => ({
      url: getDocsUrl(docPath),
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...basePages, ...docPages]
  }
  catch (error) {
    console.error('生成 sitemap 失败:', error)

    // 如果获取文档路径失败，至少返回基础页面
    return basePages
  }
}
