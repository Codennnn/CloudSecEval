'use client'

const data = [
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '人员',
    需升级数量: '',
    当天升级数量: '',
    成功: '数量',
    作业表单: '',
    预计完: '成时间',
    批准人: '',
    升级文件信息: '',
  },
  {
    序号: 1,
    日期: '2025-04-03',
    分类: '远程升级',
    具体内容: '宽带载波升级',
    厂家: '华立',
    操作: 'XXX',
    需升级数量: 33,
    当天升级数量: 33,
    成功: 33,
    作业表单: '20250403-计量自动化系统终端远程升级作业单',
    预计完: '2025-04-03',
    批准人: 'XXX',
    升级文件信息: '名称：app.zip；',
  },
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '',
    需升级数量: '',
    当天升级数量: '',
    成功: '',
    作业表单: '',
    预计完: '',
    批准人: '',
    升级文件信息: '软件版本日期：2024-11-28',
  },
  {
    序号: 2,
    日期: '2025-04-03',
    分类: '远程升级',
    具体内容: '宽带载波升级',
    厂家: '三星',
    操作: 'XXX',
    需升级数量: 40,
    当天升级数量: 40,
    成功: 37,
    作业表单: '20250403-计量自动化系统终端远程升级作业单',
    预计完: '2025-04-03',
    批准人: 'XXX',
    升级文件信息: '名称：update.img；',
  },
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '',
    需升级数量: '',
    当天升级数量: '',
    成功: '',
    作业表单: '',
    预计完: '',
    批准人: '',
    升级文件信息: '软件版本日期：2024-11-16',
  },
  {
    序号: 3,
    日期: '2025-04-03',
    分类: '远程升级',
    具体内容: '宽带载波升级',
    厂家: '林洋',
    操作: 'XXX',
    需升级数量: 28,
    当天升级数量: 28,
    成功: 23,
    作业表单: '20250403-计量自动化系统终端远程升级作业单',
    预计完: '2025-04-03',
    批准人: 'XXX',
    升级文件信息: '名称：update.pka；',
  },
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '',
    需升级数量: '',
    当天升级数量: '',
    成功: '',
    作业表单: '',
    预计完: '',
    批准人: '',
    升级文件信息: '软件版本：3107 版本发布日期：2025-2-24',
  },
  {
    序号: 4,
    日期: '2025-04-08',
    分类: '远程升级',
    具体内容: '宽带载波升级',
    厂家: '华立',
    操作: 'XXX',
    需升级数量: 1,
    当天升级数量: 1,
    成功: 1,
    作业表单: '20250408-计量自动化系统终端远程升级作业单',
    预计完: '2025-04-08',
    批准人: 'XXX',
    升级文件信息: '名称：app.zip；',
  },
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '',
    需升级数量: '',
    当天升级数量: '',
    成功: '',
    作业表单: '',
    预计完: '',
    批准人: '',
    升级文件信息: '软件版本日期：2024-11-28',
  },
  {
    序号: 5,
    日期: '2025-04-08',
    分类: '远程升级',
    具体内容: '宽带载波升级',
    厂家: '林洋',
    操作: 'XXX',
    需升级数量: 7,
    当天升级数量: 7,
    成功: 4,
    作业表单: '20250408-计量自动化系统终端远程升级作业单',
    预计完: '2025-04-08',
    批准人: 'XXX',
    升级文件信息: '名称：update.pka；',
  },
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '',
    需升级数量: '',
    当天升级数量: '',
    成功: '',
    作业表单: '',
    预计完: '',
    批准人: '',
    升级文件信息: '软件版本：3107 版本发布日期：2025-2-24',
  },
  {
    序号: 6,
    日期: '2025-04-08',
    分类: '远程升级',
    具体内容: '宽带载波升级',
    厂家: '三星',
    操作: 'XXX',
    需升级数量: 40,
    当天升级数量: 40,
    成功: 36,
    作业表单: '20250408-计量自动化系统终端远程升级作业单',
    预计完: '2025-04-08',
    批准人: 'XXX',
    升级文件信息: '名称：update.img；',
  },
  {
    序号: '',
    日期: '',
    分类: '',
    具体内容: '',
    厂家: '',
    操作: '',
    需升级数量: '',
    当天升级数量: '',
    成功: '',
    作业表单: '',
    预计完: '',
    批准人: '',
    升级文件信息: '软件版本日期：2024-11-16',
  },
]

export default function HtmlTable() {
  const tableHeaders = Object.keys(data[0])
  const tableHeaderRow = data[0]
  const tableRows = data.slice(1)

  return (
    <table
      cellPadding={8}
      cellSpacing={0}
      rules="all"
      style={{
        border: '1px solid #000',
        borderCollapse: 'collapse',
        textAlign: 'center',
      }}
    >
      <tbody>
        <tr>
          {tableHeaders.map((header, idx) => {
            const nextRowTdContent = tableHeaderRow[header]

            return (
              <td
                key={idx}
                rowSpan={nextRowTdContent ? undefined : 2}
                style={{
                  padding: '4px',
                  border: '1px solid #000',
                  borderBottom: nextRowTdContent ? 'none' : undefined,
                  fontWeight: 'bold',
                  backgroundColor: '#DEDEDE',
                }}
              >
                {header}
              </td>
            )
          })}
        </tr>

        <tr>
          {tableHeaders.map((header, idx) => {
            const content = tableHeaderRow[header]

            if (!content) {
              return null
            }

            return (
              <td
                key={idx + 1}
                style={{
                  padding: '4px',
                  border: '1px solid #000',
                  borderTop: 'none',
                  fontWeight: 'bold',
                  backgroundColor: '#DEDEDE',
                }}
              >
                {content}
              </td>
            )
          })}
        </tr>

        {
          tableRows.map((item, rowIdx, rows) => {
            return (
              <>
                <tr>
                  {tableHeaders.map((header, idx) => {
                    const content = item[header]

                    if (!content) {
                      return null
                    }

                    const nextRow = rows[rowIdx + 1]
                    const nextRowTdContent = nextRow?.[header]

                    const isOddRow = (rowIdx + 1) % 2 === 1
                    const isNextCellEmpty
                    = nextRow && (nextRowTdContent === '' || nextRowTdContent === undefined || nextRowTdContent === null)
                    const shouldRowSpan
                    = isOddRow && isNextCellEmpty

                    return (
                      <td
                        key={idx + 1}
                        rowSpan={shouldRowSpan ? 2 : undefined}
                        style={{ padding: '4px', border: '1px solid #000' }}
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              </>
            )
          })
        }
      </tbody>
    </table>
  )
}
