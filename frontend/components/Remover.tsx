'use client'

import { useState, useCallback, useRef } from 'react'

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || ''

type State = 'idle' | 'loading' | 'done' | 'error'

export default function Remover() {
  const [state, setState] = useState<State>('idle')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('仅支持 JPG / PNG / WebP 格式')
      setState('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('文件大小不能超过 10MB')
      setState('error')
      return
    }

    setState('loading')
    setOriginalUrl(URL.createObjectURL(file))
    setResultUrl(null)
    setErrorMsg('')

    try {
      const form = new FormData()
      form.append('image_file', file)

      const res = await fetch(`${WORKER_URL}/api/remove-bg`, { method: 'POST', body: form })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.errors?.[0]?.title || '处理失败，请重试')
      }

      const blob = await res.blob()
      setResultUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '未知错误')
      setState('error')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors bg-white
          ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
      >
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <button
          type="button"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        >
          选择图片
        </button>
        <p className="text-gray-400 text-sm mt-3">或拖拽图片到此处 · 支持 JPG / PNG / WebP · 最大 10MB</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
      </div>

      {/* Error */}
      {state === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div className="mt-10 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">正在处理，请稍候...</p>
        </div>
      )}

      {/* Result */}
      {state === 'done' && originalUrl && resultUrl && (
        <div className="mt-10">
          <h3 className="text-center text-lg font-semibold text-gray-800 mb-6">处理结果</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 border-b">原图</p>
              <img src={originalUrl} alt="原图" className="w-full object-contain max-h-72" />
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 border-b">去背景</p>
              {/* Checkerboard background to show transparency */}
              <div
                className="w-full max-h-72 overflow-hidden"
                style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 20px 20px' }}
              >
                <img src={resultUrl} alt="去背景结果" className="w-full object-contain max-h-72" />
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <a
              href={resultUrl}
              download="removed-bg.png"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              下载 PNG
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
