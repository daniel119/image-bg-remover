import Remover from '@/components/Remover'

export default function Home() {
  return (
    <main>
      <header className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          BG<span className="text-indigo-500">Remover</span>
        </h1>
      </header>

      <section className="text-center py-16 px-4">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">一键去除图片背景</h2>
        <p className="text-gray-500 text-lg">上传图片，秒速处理，免费下载透明底 PNG</p>
      </section>

      <Remover />

      <footer className="text-center py-8 text-sm text-gray-400">
        Powered by{' '}
        <a href="https://www.remove.bg" target="_blank" rel="noreferrer" className="underline">
          remove.bg
        </a>
      </footer>
    </main>
  )
}
