'use client'
import Image from 'next/image'
import { getSnippet } from '@/utils/sanitize'

interface News {
    id: string | number
    title: string
    body: string
    image_urls: string[]
    date: string
}

interface NewsPreviewProps {
    news: News[]
}

export default function NewsPreview({ news }: NewsPreviewProps) {
    return (
        <section className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {news.map(item => (
                <a
                    key={item.id}
                    className="flex flex-col items-center w-[260px]"
                    href={`/news-detail/${item.id}`}
                >
                    <Image
                        src={item.image_urls[0]}
                        alt={item.title}
                        width={300}
                        height={200}
                        className="rounded mb-4"
                    />
                    <div className="text-center">
                        <p className="text-[#8B0000] mb-2 font-raleway font-bold">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                        <h2 className="font-raleway font-extrabold text-lg mb-1">{item.title}</h2>
                        <p className="font-merriweather leading-loose tracking-wider font-light text-sm">{getSnippet(item.body, 8)}</p>
                    </div>
                </a>
            ))}
        </section>
    )
}