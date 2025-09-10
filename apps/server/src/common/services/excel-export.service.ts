import { Injectable, StreamableFile } from '@nestjs/common'
import ExcelJS from 'exceljs'
import type { Response } from 'express'

/**
 * 导出列定义（类型安全）
 */
export interface ExportColumn<Row = unknown> {
  /** 字段路径，如 user.profile.name */
  readonly key: string
  /** 表头 */
  readonly header: string
  /** 列宽（字符数） */
  readonly width?: number
  /** 数字/日期格式化（Excel 内部格式） */
  readonly numFmt?: string
  /** 水平对齐方式 */
  readonly align?: 'left' | 'center' | 'right'
  /**
   * 单元格值转换器
   * @description 当需要日期/枚举等格式化时使用；优先于 key 映射
   */
  readonly transform?: (row: Row, index: number) => unknown
}

/**
 * 导出选项
 */
export interface ExcelExportOptions<Row = unknown> {
  /** 导出文件名（含扩展名） */
  readonly fileName: string
  /** 工作表名称 */
  readonly sheetName?: string
  /** 列配置 */
  readonly columns: readonly ExportColumn<Row>[]
  /** 时区（如需格式化日期，可由调用方处理） */
  readonly timezone?: string
  /** 是否采用流式输出（大数据集建议启用） */
  readonly streaming?: boolean
}

/**
 * 安全获取对象路径值，如 'a.b.c'。
 * @remarks 不抛异常，取不到返回 undefined。
 */
function getValueByPath(source: unknown, path: string): unknown {
  if (typeof path !== 'string' || path.length === 0) {
    return undefined
  }

  const parts = path.split('.')
  let cursor: unknown = source

  for (const part of parts) {
    if (cursor !== null && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part]
    }
    else {
      cursor = undefined
      break
    }
  }

  return cursor
}

/**
 * 通用 Excel 导出服务
 * - 小/中数据集：exportArray 返回 StreamableFile
 * - 大数据集：exportStream 直接写入 HTTP 响应流
 */
@Injectable()
export class ExcelExportService {
  /**
   * 小/中数据量导出：一次性生成 Buffer
   * @param rows 数据行数组
   * @param options 导出选项
   */
  async exportArray<Row = unknown>(
    rows: readonly Row[],
    options: ExcelExportOptions<Row>,
  ): Promise<StreamableFile> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(options.sheetName ?? 'Sheet1')

    this.applyColumns(sheet, options.columns)
    this.appendRows(sheet, rows, options.columns)

    const buffer = await workbook.xlsx.writeBuffer()

    return new StreamableFile(Buffer.from(buffer))
  }

  /**
   * 大数据量导出：分批异步迭代并写入响应流
   * @param batchIterator 异步批次迭代器
   * @param res Express 响应对象
   * @param options 导出选项
   */
  async exportStream<Row = unknown>(
    batchIterator: AsyncIterable<readonly Row[]>,
    res: Response,
    options: ExcelExportOptions<Row>,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(options.sheetName ?? 'Sheet1')

    this.applyColumns(sheet, options.columns)

    let total = 0

    for await (const batch of batchIterator) {
      this.appendRows(sheet, batch, options.columns, total)
      total += batch.length
    }

    // 直接写入 HTTP 流
    await workbook.xlsx.write(res)
  }

  /**
   * 应用列配置
   */
  private applyColumns<Row = unknown>(
    sheet: ExcelJS.Worksheet,
    columns: readonly ExportColumn<Row>[],
  ): void {
    sheet.columns = columns.map((col) => {
      const partial: Partial<ExcelJS.Column> = {
        header: col.header,
        key: col.key,
        width: col.width ?? 20,
        style: {
          alignment: { horizontal: col.align ?? 'left' },
          numFmt: col.numFmt,
        },
      }

      return partial
    }) as ExcelJS.Column[]

    sheet.views = [{ state: 'frozen', ySplit: 1 }]
  }

  /**
   * 追加行数据
   */
  private appendRows<Row = unknown>(
    sheet: ExcelJS.Worksheet,
    rows: readonly Row[],
    columns: readonly ExportColumn<Row>[],
    startIndex = 0,
  ): void {
    for (const [i, row] of rows.entries()) {
      const values: unknown[] = []

      for (const col of columns) {
        if (typeof col.transform === 'function') {
          values.push(col.transform(row, startIndex + i))
        }
        else {
          values.push(getValueByPath(row, col.key))
        }
      }

      sheet.addRow(values)
    }
  }
}

export type { ExcelJS }
