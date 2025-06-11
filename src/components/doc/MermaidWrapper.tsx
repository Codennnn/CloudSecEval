'use client'

import dynamic from 'next/dynamic'

const MermaidDiagram = dynamic(
  () => import('./MermaidDiagram').then((mod) => mod.MermaidDiagram),
  { ssr: false },
)

interface MermaidWrapperProps {
  chart: string
  className?: string
}

export function MermaidWrapper({ chart, className }: MermaidWrapperProps) {
  return <MermaidDiagram chart={chart} className={className} />
}
