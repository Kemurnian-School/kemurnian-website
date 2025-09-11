import Link from 'next/link'
import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';

interface NewsDetailProps {
  params: {
    id: string
  }
}

export default async function NewsDetail({ params }: NewsDetailProps) {
  const supabase = await createClient();
  
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !news) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <Link 
              href="/admin/news" 
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              <span>Back to News List</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
              {news.from}
            </span>
            <span className="text-sm text-gray-500">
              Published: {new Date(news.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {news.title}
          </h1>
        </div>

        {/* Images Section */}
        {news.image_urls && news.image_urls.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Images ({news.image_urls.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.image_urls.map((imageUrl: string, index: any) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`${news.title} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  />
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Embed Section */}
        {news.embed && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Embedded Video</span>
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Video URL:</p>
              <a 
                href={news.embed} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                {news.embed}
              </a>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: news.body }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between items-center">
          <Link
            href={`/admin/news/edit/${news.id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Edit This Article</span>
          </Link>
        </div>
      </div>
    </div>
  );
}