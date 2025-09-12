import { createClient } from "@/utils/supabase/client"
import Head from "next/head"
import QuillRenderer from "@/app/(main)/components/QuillRenderer"
import NewsImageSlider from "@/app/(main)/components/NewsImageSlider"
import NewsPreview from "@/app/(main)/components/NewsPreview"

interface PageProps {
    params: { id: string }
}

async function getRandomRecentNews(currentNewsId: string) {
    const supabase = createClient()
    
    const { data: latestNews, error: latestNewsError } = await supabase
        .from("news")
        .select("date")
        .order("date", { ascending: false })
        .limit(1)
    
    if (latestNewsError || !latestNews || latestNews.length === 0) {
        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
        const twoYearsAgoString = twoYearsAgo.toISOString().split('T')[0]
        
        const { data: newsData, error: newsError } = await supabase
            .from("news")
            .select("*")
            .gte("date", twoYearsAgoString)
            .neq("id", currentNewsId)
            .order("date", { ascending: false })
        
        if (newsError || !newsData || newsData.length === 0) {
            return []
        }
        
        const shuffled = [...newsData].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, 3)
    }
    
    const latestDate = new Date(latestNews[0].date)
    const twoYearsBefore = new Date(latestDate)
    twoYearsBefore.setFullYear(latestDate.getFullYear() - 2)
    const twoYearsBeforeFormatted = twoYearsBefore.toISOString().split('T')[0]
    
    const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("*")
        .gte("date", twoYearsBeforeFormatted)
        .neq("id", currentNewsId)
        .order("date", { ascending: false })
    
    if (newsError || !newsData || newsData.length === 0) {
        return []
    }
    
    // Shuffle and return 3 random news
    const shuffled = [...newsData].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
}

export default async function NewsDetailPage({ params }: PageProps) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", params.id)
        .single()
    
    if (error || !data) {
        return <div className="p-4 text-red-600">Failed to load news content.</div>
    }
    
    const randomNews = await getRandomRecentNews(params.id)
    
    return (
        <>
            <Head>
                <title>{data.title}</title>
            </Head>  
            <div className="flex justify-center items-center flex-col px-4 py-8">
                <h1 className="font-raleway font-extrabold tracking-widest uppercase text-2xl mb-4 text-center mt-12">{data.title}</h1>
                
                <p className="text-center underline text-btn-primary font-bold text-lg mb-4">
                    {new Date(data.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
                
                {data.image_urls && data.image_urls.length > 0 && (
                    <NewsImageSlider images={data.image_urls} alt={data.title} />
                )}
                
                {/* Quill content - left aligned */}
                <QuillRenderer content={data.body} className="text-justify font-merriweather font-light tracking-wider leading-loose max-w-3xl w-full" />
                
                <hr 
                    className="clear-both mx-auto my-10 h-0 w-2xl border-0 border-t-[3px] border-solid border-[#8b0000]" 
                />
                
                <h2 className="font-raleway font-extrabold text-2xl mb-8">OTHER NEWS AND EVENTS</h2>
                
                {/* Display random news using existing NewsPreview component */}
                {randomNews.length > 0 && (
                    <div className="w-full max-w-6xl">
                        <NewsPreview news={randomNews} />
                    </div>
                )}
                
                {randomNews.length === 0 && (
                    <p className="text-gray-600 font-merriweather">No other recent news available.</p>
                )}
            </div>
        </>
    )
}