'use client'

import Image from 'next/image'
import ButtonPrimary from './ButtonPrimary'

interface Kurikulum {
  id: string | number
  title: string
  body: string
}

interface KurikulumListProps {
  kurikulum: Kurikulum[]
}

export default function KurikulumList({ kurikulum }: KurikulumListProps) {
  const paragraphClasses = 'font-merriweather font-[100] leading-loose tracking-wider text-center list-disc list-inside'

  const getSnippet = (text: string, wordCount: number = 25) => {
    const plainText = text.replace(/<[^>]+>/g, '') // strip HTML
    const words = plainText.split(/\s+/)
    let snippet = words.slice(0, wordCount).join(' ')
    if (words.length > wordCount) snippet += '...'
    return snippet
  }

  return (
    <section className="flex justify-center">
      <div className="w-full px-4">
        <div className="flex flex-wrap justify-center gap-6">
          {kurikulum.map(item => (
            <div
              key={item.id}
              className="flex justify-center items-center flex-col text-center max-w-lg flex-shrink-0 p-4"
            >
              <div className="flex justify-center mb-4">
                <Image
                  src="/icon-book.svg"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="w-12"
                />
              </div>
              <h2 className="font-bold mb-2 text-xl">{item.title}</h2>
              <p className={paragraphClasses}>{getSnippet(item.body)}</p>

              <ButtonPrimary href={`/kurikulum/${item.id}`} text="READ ON" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}