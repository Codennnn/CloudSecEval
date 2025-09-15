import { SITE_CONFIG } from '~/constants/common'

export default function DashPage() {
  return (
    <div className="crowd-test-dashboard bg-crowd-test-dashboard-background h-screen relative">
      <div className="z-10 absolute left-1/2 -translate-x-1/2 top-6 text-3xl font-extrabold">
        {SITE_CONFIG.adminTitle}
      </div>

      <img
        alt="NestJS Logo"
        className="size-full absolute inset-0 pointer-events-none z-0"
        src="/assets/crowd-test/dash-outlet-border.png"
      />
    </div>
  )
}
