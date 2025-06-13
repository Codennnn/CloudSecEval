import { TextShimmer } from '~/components/TextShimmer'

export function LoadingMessage() {
  return (
    <div className="text-sm">
      <TextShimmer>正在思考...</TextShimmer>
    </div>
  )
}
