import { get } from 'lodash-es'

import type { ApprovalStatusStatsDataDto } from '~api/types.gen'
import { getVulSeverity, VulnerabilitySeverity } from '~crowd-test/constants'

const baselineCount = 50

interface BugLevelProps {
  data?: ApprovalStatusStatsDataDto['severityStats']
}

export function BugLevel(props: BugLevelProps) {
  const { data } = props

  const bugLevelData = [
    {
      level: getVulSeverity(VulnerabilitySeverity.CRITICAL).label,
      value: get(data, `${VulnerabilitySeverity.CRITICAL}.count`, 0) as number,
    },
    {
      level: getVulSeverity(VulnerabilitySeverity.HIGH).label,
      value: get(data, `${VulnerabilitySeverity.HIGH}.count`, 0) as number,
    },
    {
      level: getVulSeverity(VulnerabilitySeverity.MEDIUM).label,
      value: get(data, `${VulnerabilitySeverity.MEDIUM}.count`, 0) as number,
    },
    {
      level: getVulSeverity(VulnerabilitySeverity.LOW).label,
      value: get(data, `${VulnerabilitySeverity.LOW}.count`, 0) as number,
    },
  ]

  return (
    <div className="flex flex-col gap-2 max-w-[370px]">
      {bugLevelData.map((item) => (
        <div key={item.level} className="flex items-center gap-2 text-sm">
          <div className="font-medium">{item.level}：</div>

          <div className="h-3 flex-1 flex items-center gap-1">
            <div className="h-full flex-1 rounded-xs overflow-hidden bg-gradient-to-r from-theme2/10 to-transparent">
              <div
                className="h-full bg-gradient-to-r from-theme to-95% to-theme2"
                style={{
                  width: `${(item.value / baselineCount) * 100}%`,
                }}
              />
            </div>

            <div className="text-sm shrink-0 w-10 text-right opacity-70 whitespace-nowrap">
              <span className="font-semibold mr-0.5 tabular-nums">
                {item.value}
              </span>
              个
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
