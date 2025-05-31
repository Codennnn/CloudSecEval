import Image, { type StaticImageData } from 'next/image'

import { cn } from '~/lib/utils'

interface DocImageProps {
  src: string | StaticImageData
  alt?: string
  caption?: string
  className?: string
  width?: number
  height?: number
}

export function DocImage(props: DocImageProps) {
  const { src, alt = '', caption, className, width, height } = props

  // 判断 src 是否为导入的静态图片资源
  const isStaticImage = typeof src === 'object' && 'src' in src

  // 获取图片尺寸
  const imageWidth = width ?? (isStaticImage ? src.width : 600)
  const imageHeight = height ?? (isStaticImage ? src.height : 400)

  return (
    <figure className={cn('flex flex-col items-center', className)}>
      <Image
        alt={alt}
        className="illustrative-image rounded-lg h-auto max-w-full"
        height={imageHeight}
        placeholder="blur"
        src={src}
        width={imageWidth}
      />

      {caption && (
        <figcaption className="mt-3 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
