import { useEffect, useRef } from 'react'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Alignment,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  type EditorConfig,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  PictureEditing,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  Underline,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

const editorConfig: EditorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Subscript,
    Superscript,
    FontSize,
    FontColor,
    FontBackgroundColor,
    List,
    Link,
    BlockQuote,
    Table,
    TableToolbar,
    Image,
    ImageCaption,
    ImageToolbar,
    ImageUpload,
    ImageResize,
    ImageStyle,
    PictureEditing,
    Base64UploadAdapter,
    Indent,
    IndentBlock,
    Alignment,
    HorizontalLine,
    Code,
    CodeBlock,
    RemoveFormat,
    SpecialCharacters,
    SpecialCharactersEssentials,
  ],
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'subscript',
      'superscript',
      '|',
      'link',
      'code',
      'removeFormat',
      '|',
      'bulletedList',
      'numberedList',
      'outdent',
      'indent',
      '|',
      'alignment',
      'blockQuote',
      'horizontalLine',
      '|',
      'insertTable',
      'codeBlock',
      'specialCharacters',
      '|',
      'uploadImage',
    ],
  },
  heading: {
    options: [
      { model: 'paragraph', title: '段落', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: '标题 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: '标题 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: '标题 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: '标题 4', class: 'ck-heading_heading4' },
    ],
  },
  fontSize: {
    options: [
      9,
      10,
      11,
      12,
      'default',
      14,
      16,
      18,
      20,
      22,
      24,
      26,
      28,
      36,
      48,
      72,
    ],
  },
  fontColor: {
    colors: [
      {
        color: 'hsl(0, 0%, 0%)',
        label: '黑色',
      },
      {
        color: 'hsl(0, 0%, 30%)',
        label: '深灰色',
      },
      {
        color: 'hsl(0, 0%, 60%)',
        label: '灰色',
      },
      {
        color: 'hsl(0, 0%, 90%)',
        label: '浅灰色',
      },
      {
        color: 'hsl(0, 0%, 100%)',
        label: '白色',
        hasBorder: true,
      },
      {
        color: 'hsl(0, 75%, 60%)',
        label: '红色',
      },
      {
        color: 'hsl(30, 75%, 60%)',
        label: '橙色',
      },
      {
        color: 'hsl(60, 75%, 60%)',
        label: '黄色',
      },
      {
        color: 'hsl(90, 75%, 60%)',
        label: '浅绿色',
      },
      {
        color: 'hsl(120, 75%, 60%)',
        label: '绿色',
      },
      {
        color: 'hsl(150, 75%, 60%)',
        label: '青绿色',
      },
      {
        color: 'hsl(180, 75%, 60%)',
        label: '青色',
      },
      {
        color: 'hsl(210, 75%, 60%)',
        label: '浅蓝色',
      },
      {
        color: 'hsl(240, 75%, 60%)',
        label: '蓝色',
      },
      {
        color: 'hsl(270, 75%, 60%)',
        label: '紫色',
      },
    ],
  },
  fontBackgroundColor: {
    colors: [
      {
        color: 'hsl(0, 0%, 100%)',
        label: '白色',
        hasBorder: true,
      },
      {
        color: 'hsl(0, 0%, 90%)',
        label: '浅灰色',
      },
      {
        color: 'hsl(0, 0%, 60%)',
        label: '灰色',
      },
      {
        color: 'hsl(0, 0%, 30%)',
        label: '深灰色',
      },
      {
        color: 'hsl(0, 0%, 0%)',
        label: '黑色',
      },
      {
        color: 'hsl(0, 75%, 90%)',
        label: '浅红色',
      },
      {
        color: 'hsl(30, 75%, 90%)',
        label: '浅橙色',
      },
      {
        color: 'hsl(60, 75%, 90%)',
        label: '浅黄色',
      },
      {
        color: 'hsl(90, 75%, 90%)',
        label: '浅绿色',
      },
      {
        color: 'hsl(120, 75%, 90%)',
        label: '绿色',
      },
      {
        color: 'hsl(150, 75%, 90%)',
        label: '浅青绿色',
      },
      {
        color: 'hsl(180, 75%, 90%)',
        label: '浅青色',
      },
      {
        color: 'hsl(210, 75%, 90%)',
        label: '浅蓝色',
      },
      {
        color: 'hsl(240, 75%, 90%)',
        label: '蓝色',
      },
      {
        color: 'hsl(270, 75%, 90%)',
        label: '浅紫色',
      },
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
  image: {
    toolbar: [
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      '|',
      'imageResize',
      '|',
      'toggleImageCaption',
      'imageTextAlternative',
    ],
    resizeOptions: [
      {
        name: 'imageResize:original',
        label: '原始尺寸',
        value: null,
      },
      {
        name: 'imageResize:25',
        label: '25%',
        value: '25',
      },
      {
        name: 'imageResize:50',
        label: '50%',
        value: '50',
      },
      {
        name: 'imageResize:75',
        label: '75%',
        value: '75',
      },
    ],
  },
}

export interface CKRichEditorProps {
  /** 编辑器的值 */
  value?: string
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
  /** 是否禁用编辑器 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
}

/**
 * CKEditor 富文本编辑器组件
 * 支持受控和非受控两种模式
 */
export function CKRichEditor(props: CKRichEditorProps) {
  const { value, onChange, placeholder, disabled } = props

  const editorRef = useRef<ClassicEditor | null>(null)
  const isControlled = value !== undefined

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = (_event: unknown, editor: ClassicEditor) => {
    const data: string = editor.getData()

    if (onChange) {
      onChange(data)
    }
  }

  /**
   * 处理编辑器准备就绪
   */
  const handleEditorReady = (editor: ClassicEditor) => {
    editorRef.current = editor

    // 如果是受控组件且有初始值，设置编辑器内容
    if (isControlled && typeof value === 'string') {
      editor.setData(value)
    }
  }

  /**
   * 当外部 value 变化时，同步更新编辑器内容
   */
  useEffect(() => {
    if (isControlled && editorRef.current && typeof value === 'string') {
      const currentData: string = editorRef.current.getData()

      // 只有当外部值与编辑器当前值不同时才更新，避免无限循环
      if (currentData !== value) {
        editorRef.current.setData(value)
      }
    }
  }, [value, isControlled])

  return (
    <CKEditor
      config={{
        ...editorConfig,
        placeholder,
      }}
      disabled={disabled}
      editor={ClassicEditor}
      onChange={handleEditorChange}
      onReady={handleEditorReady}
    />
  )
}
