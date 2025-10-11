import matter from 'gray-matter'

/**
 * Docker 文档的 Front Matter 数据结构
 */
export interface DockerDocFrontMatter {
  /**
   * 文档标题
   */
  title?: string
  /**
   * 文档描述
   */
  description?: string
  /**
   * 文档权重(用于排序)
   */
  weight?: number
  /**
   * 关键词
   */
  keywords?: string[]
  /**
   * 其他自定义字段
   */
  [key: string]: unknown
}

export interface ParsedMarkdown {
  /**
   * Front Matter 元数据
   */
  frontMatter: DockerDocFrontMatter
  /**
   * 去除 Front Matter 后的 Markdown 内容
   */
  content: string
}

/**
 * 解析包含 YAML Front Matter 的 Markdown 内容
 *
 * @param markdown - 原始 Markdown 字符串
 * @returns 解析后的元数据和内容
 */
export function parseFrontMatter(markdown: string): ParsedMarkdown {
  const { data, content } = matter(markdown)

  return {
    frontMatter: data as DockerDocFrontMatter,
    content,
  }
}
