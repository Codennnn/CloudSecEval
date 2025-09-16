import { BugReportForm } from './BugReportForm'

export function BugReportFormEdit() {
  return (
    <div>
      <BugReportForm
        onSubmit={(values) => {
          console.log('submit', values)
        }}
      />
    </div>
  )
}
