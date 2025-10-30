import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '~/components/ui/table'

/**
 * 配置项接口
 */
interface ConfigItem {
  label: string
  value: string
  approver?: string
}

/**
 * 配置信息表格组件属性
 */
interface ConfigTableProps {
  configs: ConfigItem[]
}

/**
 * 配置信息表格组件
 * 展示任务的配置信息，带有绿色左边框
 */
export function ConfigTable(props: ConfigTableProps) {
  const { configs } = props

  return (
    <div className="rounded-md border-l-4 border-green-500 bg-green-50/50">
      <Table>
        <TableBody>
          {configs.map((config, index) => (
            <TableRow
              key={index}
              className="border-b last:border-b-0"
            >
              <TableCell className="w-32 font-medium">
                {config.label}：
              </TableCell>
              <TableCell className="text-muted-foreground">
                {config.value}
              </TableCell>
              {config.approver && (
                <>
                  <TableCell className="w-24 text-right font-medium">
                    审批人：
                  </TableCell>
                  <TableCell className="w-32 text-muted-foreground">
                    {config.approver}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

