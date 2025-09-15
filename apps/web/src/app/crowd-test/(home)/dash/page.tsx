import { SITE_CONFIG } from '~/constants/common'

import { BugLevel } from './components/BugLevel'
import { DashCard } from './components/DashCard'
import { DashDecoratorImg } from './components/DashDecoratorImg'

export default function DashPage() {
  return (
    <div className="crowd-test-dashboard bg-crowd-test-dashboard-background h-screen p-2">
      <div className="relative size-full">
        <div className="z-10 absolute left-1/2 -translate-x-1/2 top-8 text-3xl font-extrabold">
          {SITE_CONFIG.adminTitle}
        </div>

        <div className="flex flex-col h-full">
          <div className="py-15" />

          <div className="flex-1 py-20 px-10">
            <div className="flex h-full gap-8">
              <div className="basis-1/4">
                <DashCard title="发现漏洞等级">
                  <BugLevel />
                </DashCard>

                <DashCard title="团队排行榜" />
              </div>

              <div className="flex-1 relative">
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

              <div className="basis-1/4">
                <DashCard title="报告成果">
                  <BugLevel />
                </DashCard>

                <DashCard title="报告提交统计" />
              </div>
            </div>
          </div>
        </div>

        <DashDecoratorImg
          className="size-full absolute inset-0 z-0"
          src="/assets/crowd-test/dash-outlet-border.png"
        />
      </div>
    </div>
  )
}
