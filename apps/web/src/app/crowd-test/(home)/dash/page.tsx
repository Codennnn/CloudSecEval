'use client'

import { useQuery } from '@tanstack/react-query'

import { SITE_CONFIG } from '~/constants/common'

import { BugLevel } from './components/BugLevel'
import { BugReportStats } from './components/BugReportStats'
import { DashCard } from './components/DashCard'
import { DashDecoratorImg } from './components/DashDecoratorImg'
import { RealTimeActivityMonitor } from './components/RealTimeActivityMonitor'
import { ReportActivityChart } from './components/ReportActivityChart'
import { ReportSubmitChart } from './components/ReportSubmitChart'
import { TeamOnlineChart } from './components/TeamOnlineChart'
import { TeamRanking } from './components/TeamRanking'

import { bugReportsControllerGetApprovalStatusStatsOptions } from '~api/@tanstack/react-query.gen'

export default function DashPage() {
  const { data } = useQuery(
    bugReportsControllerGetApprovalStatusStatsOptions(),
  )
  const statsData = data?.data

  return (
    <div className="crowd-test-dashboard bg-crowd-test-dashboard-background h-screen w-screen px-2 overflow-hidden">
      <div className="relative size-full">
        <div className="z-10 absolute left-1/2 -translate-x-1/2 top-8 text-3xl font-extrabold">
          {SITE_CONFIG.adminTitle}
        </div>

        <div className="flex flex-col h-full">
          <div className="basis-[130px] overflow-hidden" />

          <div className="flex-1 px-10 min-h-0 overflow-y-auto">
            <div className="flex h-full gap-8 overflow-hidden">
              <div className="basis-1/4 flex flex-col gap-dash-card">
                <DashCard title="报告成果">
                  <BugReportStats data={statsData?.statusStats} />
                </DashCard>

                <DashCard title="发现漏洞等级">
                  <BugLevel data={statsData?.severityStats} />
                </DashCard>

                <DashCard className="flex-1 overflow-hidden" title="团队排行榜">
                  <TeamRanking />
                </DashCard>
              </div>

              <div className="flex-1 flex flex-col gap-dash-card">
                <div className="relative flex-1">
                  <div className="absolute top-[16%] left-1/2 -translate-x-1/2 z-20 w-[380px]">
                    <span className="text-xl font-bold z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">攻防演练数据总览</span>
                    <DashDecoratorImg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      src="/assets/crowd-test/dash-center-text-bg.png"
                    />
                  </div>

                  <div className="absolute inset-0 -translate-y-4">
                    <DashDecoratorImg
                      className="absolute left-1/2 -translate-x-[52%] top-1/2 -translate-y-[75%] z-10 w-1/3"
                      src="/assets/crowd-test/dash-center-shield.png"
                    />

                    <DashDecoratorImg
                      className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-0"
                      src="/assets/crowd-test/dash-center.webp"
                    />
                  </div>
                </div>

                <DashCard contentClassName="max-h-80" title="攻防活动监测">
                  <RealTimeActivityMonitor />
                </DashCard>
              </div>

              <div className="basis-1/4 flex flex-col gap-dash-card">
                <DashCard title="团队在线情况">
                  <TeamOnlineChart />
                </DashCard>

                <DashCard title="报告提交统计">
                  <ReportSubmitChart />
                </DashCard>

                <DashCard title="报告活动监测">
                  <ReportActivityChart />
                </DashCard>
              </div>
            </div>
          </div>

          <div className="basis-[80px] overflow-hidden" />
        </div>

        <DashDecoratorImg
          className="size-full absolute inset-0 z-0"
          src="/assets/crowd-test/dash-outlet-border.png"
        />
      </div>
    </div>
  )
}
