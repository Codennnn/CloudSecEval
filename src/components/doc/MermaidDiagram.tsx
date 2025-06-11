'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTheme } from 'next-themes'
import { MaximizeIcon, MinimizeIcon, MoveIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram(props: MermaidDiagramProps) {
  const { chart, className = '' } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState<string>('')
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullScreen, setIsFullScreen] = useState(false)

  const { resolvedTheme } = useTheme()

  // 初始化 mermaid 并根据主题设置不同的配置
  useEffect(() => {
    const isDark = resolvedTheme === 'dark'

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      themeVariables: isDark
        ? {
            // 暗色主题配置
            primaryColor: '#2D3748',
            primaryTextColor: '#E2E8F0',
            primaryBorderColor: '#4A5568',
            background: '#1A202C',
            lineColor: '#A0AEC0',
            textColor: '#E2E8F0',
            mainBkg: '#2D3748',
            secondaryColor: '#4A5568',
            tertiaryColor: '#718096',
            edgeLabelBackground: '#2D3748',
            clusterBkg: '#2D3748',
            clusterBorder: '#4A5568',
            titleColor: '#E2E8F0',
            nodeBorder: '#4A5568',
            arrowheadColor: '#A0AEC0',
          }
        : {
            // 亮色主题配置
            primaryColor: '#FFFFFF',
            primaryTextColor: '#252525',
            primaryBorderColor: '#EBEBEB',
            background: '#FFFFFF',
            lineColor: '#8E8E8E',
            textColor: '#252525',
            mainBkg: '#F7FAFC',
            secondaryColor: '#EDF2F7',
            tertiaryColor: '#E2E8F0',
            edgeLabelBackground: '#FFFFFF',
            clusterBkg: '#F7FAFC',
            clusterBorder: '#E2E8F0',
            titleColor: '#252525',
            nodeBorder: '#EBEBEB',
            arrowheadColor: '#8E8E8E',
          },
    })
  }, [resolvedTheme]) // 当主题变化时重新初始化

  // 渲染图表 - 当主题变化或图表内容变化时重新渲染
  useEffect(() => {
    const renderChart = async () => {
      if (!chart) {
        return
      }

      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart)
        setRendered(svg)
      }
      catch (error) {
        console.error('渲染 Mermaid 图表时出错:', error)

        if (error instanceof Error) {
          setRendered(`<pre>${error.message}</pre>`)
        }
      }
    }

    void renderChart()
  }, [chart, resolvedTheme]) // 添加 theme 作为依赖，确保主题变化时重新渲染

  // 处理缩放
  const handleZoom = (delta: number) => {
    setScale((prevScale) => {
      const newScale = prevScale + delta

      return newScale < 0.5 ? 0.5 : newScale > 3 ? 3 : newScale
    })
  }

  // 处理拖拽开始
  const handleDragStart = (ev: React.MouseEvent | React.TouchEvent) => {
    ev.preventDefault()
    setIsDragging(true)

    if ('touches' in ev) {
      // 触摸事件
      setDragStart({
        x: ev.touches[0].clientX - position.x,
        y: ev.touches[0].clientY - position.y,
      })
    }
    else {
      // 鼠标事件
      setDragStart({
        x: ev.clientX - position.x,
        y: ev.clientY - position.y,
      })
    }
  }

  // 处理拖拽中
  const handleDrag = useEvent((ev: MouseEvent | TouchEvent) => {
    if (!isDragging) {
      return
    }

    let clientX, clientY

    if ('touches' in ev) {
      // 触摸事件
      clientX = ev.touches[0].clientX
      clientY = ev.touches[0].clientY
    }
    else {
      // 鼠标事件
      clientX = ev.clientX
      clientY = ev.clientY
    }

    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  })

  // 处理拖拽结束
  const handleDragEnd = useEvent(() => {
    setIsDragging(false)
  })

  // 添加和移除全局事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('touchmove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchend', handleDragEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('touchmove', handleDrag)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging, dragStart, handleDrag, handleDragEnd])

  // 处理全屏切换
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)

    // 重置位置和缩放
    if (!isFullScreen) {
      setPosition({ x: 0, y: 0 })
      setScale(1)
    }
  }

  // 重置位置和缩放
  const resetView = () => {
    setPosition({ x: 0, y: 0 })
    setScale(1)
  }

  // 添加处理滚轮事件的事件监听器
  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    // 使用原生事件监听器，并添加 { passive: true }
    const wheelHandler = (e: WheelEvent) => {
      if (e.ctrlKey || isFullScreen) {
        // 仅在按下Ctrl键或全屏模式下处理缩放
        e.stopPropagation()
        const delta = e.deltaY < 0 ? 0.1 : -0.1
        handleZoom(delta)
      }
    }

    container.addEventListener('wheel', wheelHandler, { passive: true })

    return () => {
      container.removeEventListener('wheel', wheelHandler)
    }
  }, [isFullScreen])

  return (
    <div
      ref={containerRef}
      className={`relative ${className} ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'w-full'}`}
    >
      {/* 控制按钮 */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10 p-1 rounded-md">
        <button
          aria-label="放大"
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => { handleZoom(0.1) }}
        >
          <ZoomInIcon className="w-5 h-5" />
        </button>
        <button
          aria-label="缩小"
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => { handleZoom(-0.1) }}
        >
          <ZoomOutIcon className="w-5 h-5" />
        </button>
        <button
          aria-label="重置视图"
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={resetView}
        >
          <MoveIcon className="w-5 h-5" />
        </button>
        <button
          aria-label={isFullScreen ? '退出全屏' : '全屏'}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={toggleFullScreen}
        >
          {isFullScreen ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* 当前缩放比例显示 */}
      <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded">
        {Math.round(scale * 100)}%
      </div>

      {/* 渲染区域 */}
      <div
        aria-label="可拖动的图表区域"
        className="overflow-hidden w-full h-full min-h-[200px] rounded-md flex items-center justify-center"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            // 按下回车或空格也可以开始拖动
            e.preventDefault()
            // 模拟鼠标点击中心位置
            const rect = e.currentTarget.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            handleDragStart({
              preventDefault: () => {
                //
              },
              clientX: centerX,
              clientY: centerY,
            } as React.MouseEvent)
          }
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div
          dangerouslySetInnerHTML={{ __html: rendered }}
          className="inline-block"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
      </div>

      {/* 全屏模式下的关闭按钮 */}
      {isFullScreen && (
        <button
          aria-label="关闭全屏"
          className="absolute top-4 left-4 p-2 rounded-full"
          onClick={toggleFullScreen}
        >
          &times;
        </button>
      )}
    </div>
  )
}
