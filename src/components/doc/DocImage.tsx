import { cn } from '~/lib/utils'

interface DocImageProps {
  src: string
  alt?: string
  caption?: string
  className?: string
  width?: number
  height?: number
}

export function DocImage(props: DocImageProps) {
  const { src, alt = '', caption, className, width, height } = props

  return (
    <figure className={cn('flex flex-col items-center', className)}>
      <img
        alt={alt}
        className="illustrative-image rounded-lg max-w-full"
        height={height}
        src={src}
        width={width}
      />
      {caption && (
        <figcaption className="mt-3 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
