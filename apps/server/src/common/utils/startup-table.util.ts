import { table } from 'table'

import type { AppConfigService } from '~/config/services/config.service'

/**
 * 启动信息数据接口
 */
export interface StartupInfo {
  serverUrl: string
  configService: AppConfigService
}

/**
 * 创建启动信息表格
 * @param info 启动信息数据
 * @returns 格式化的表格字符串
 */
export function createStartupTable(info: StartupInfo): string {
  const { serverUrl, configService } = info

  const startupData = [
    ['项目名称', 'NestJS 文档付费阅读服务'],
    ['服务地址', serverUrl],
    ['运行环境', configService.app.env],
  ]

  return table(startupData, {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼',
    },
    columnDefault: {
      paddingLeft: 1,
      paddingRight: 1,
    },
    columns: {
      0: { alignment: 'left', width: 12 },
      1: { alignment: 'left', width: 30 },
    },
  })
}
