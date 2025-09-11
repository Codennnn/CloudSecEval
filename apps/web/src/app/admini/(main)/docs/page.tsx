import Link from 'next/link'
import { ChevronRightIcon, FileTextIcon, FolderIcon } from 'lucide-react'

import manifest from '~/content/project-docs/_manifest.json'

import { AdminRoutes } from '~admin/lib/admin-nav'

/**
 * Admin 文档索引页：列出 `src/content/project-docs` 目录下的所有 MDX 文档，
 * 基于构建期生成的 JSON 清单 `_manifest.json` 渲染列表，
 * 并生成可点击的链接跳转到 `/admini/docs/[...docPath]` 动态路由进行阅读。
 */
export default function AdminDocsPage() {
  const docPaths: string[] = Array.isArray(manifest) ? manifest : []

  // 排序，确保展示稳定
  const sortedDocPaths = docPaths
    .filter((p) => p && !p.includes('.DS_Store'))
    .sort((a, b) => a.localeCompare(b))

  return (
    <div className="p-admin-content">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">项目文档列表</h2>
          <p className="text-sm text-muted-foreground mt-1">共 {sortedDocPaths.length} 篇文档</p>
        </div>
      </div>

      {sortedDocPaths.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sortedDocPaths.map((relativePath) => {
            const segments = relativePath.split('/')
            const href = `${AdminRoutes.Docs}/${segments.map((s) => encodeURIComponent(s)).join('/')}`
            const title = segments[segments.length - 1]
            const dirPath = segments.length > 1 ? segments.slice(0, -1).join('/') : null

            return (
              <li key={relativePath} className="group">
                <Link
                  className="block h-full rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  href={href}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 rounded-md bg-muted p-2">
                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-medium text-foreground truncate">
                          {title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {dirPath && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              <FolderIcon className="h-3 w-3" />
                              {dirPath}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground break-all">/ {relativePath}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
