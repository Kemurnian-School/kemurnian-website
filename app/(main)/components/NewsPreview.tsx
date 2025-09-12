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
        <section>
            {news.map(item => (
                <a
                    key={item.id}
                    className="flex flex-col items-center mb-8"
                    href={`/news-detail/${item.id}`}
                >
                    <Image
                        src={item.image_urls[0]}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="max-w-62 h-auto mb-4"
                    />
                    <div className='max-w-78 text-center'>
                        <p className="text-[#8B0000] mb-4 font-raleway font-bold">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                        <h2 className="font-raleway font-extrabold text-xl mb-2">{item.title}</h2>
                        <p className="font-raleway text-center text-md max-w-3xl">{getSnippet(item.body, 18)}</p>
                    </div>
                </a>
            ))}
        </section>
    )
}