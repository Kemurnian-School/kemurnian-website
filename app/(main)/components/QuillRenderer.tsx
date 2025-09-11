'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface QuillRendererProps {
  content: string
  className?: string
}

function processQuillHTML(html: string): string {
  // Fix bullet lists that might be converted to ordered lists
  html = html.replace(/<ol>/g, '<ul>')
  html = html.replace(/<\/ol>/g, '</ul>')
  
  // Handle Quill's data-list attributes for bullet points
  html = html.replace(/data-list="bullet"/g, 'data-list-type="bullet"')
  html = html.replace(/data-list="ordered"/g, 'data-list-type="ordered"')
  
  // Clean up nested p tags in list items
  html = html.replace(/<li[^>]*>\s*<p>/g, '<li>')
  html = html.replace(/<\/p>\s*<\/li>/g, '</li>')
  
  // Remove Quill UI elements
  html = html.replace(/<span class="ql-ui"[^>]*><\/span>/g, '')
  
  return html
}

export default function QuillRenderer({ content, className = '' }: QuillRendererProps) {
  const [processedContent, setProcessedContent] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (content) {
      // Process and sanitize the HTML
      const processed = processQuillHTML(content)
      const sanitized = DOMPurify.sanitize(processed)
      setProcessedContent(sanitized)
    }
  }, [content])

  if (!isClient) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
  }

  return (
    <div className={`quill-renderer ${className}`}>
      <div
        dangerouslySetInnerHTML={{ __html: processedContent }}
        className="quill-content"
      />
      
      <style jsx global>{`
        .quill-content {
          white-space: pre-wrap;
        }
        
        .quill-content ol,
        .quill-content ul {
          margin: 1em 0;
          padding-left: 1.5em;
        }
        
        /* Force bullet points for lists with data-list="bullet" */
        .quill-content li[data-list="bullet"],
        .quill-content li[data-list-type="bullet"] {
          list-style-type: disc !important;
        }
        
        /* Force numbers for ordered lists */
        .quill-content li[data-list="ordered"],
        .quill-content li[data-list-type="ordered"] {
          list-style-type: decimal !important;
        }
        
        .quill-content li {
          margin-bottom: 0.5em;
        }
        
        /* Hide Quill UI elements */
        .quill-content .ql-ui {
          display: none !important;
        }
        
        /* Additional bullet point styling */
        .quill-content ul {
          list-style-type: disc;
        }
        
        .quill-content ul ul {
          list-style-type: circle;
        }
        
        .quill-content ul ul ul {
          list-style-type: square;
        }
        
        /* Ensure ordered lists show numbers */
        .quill-content ol {
          list-style-type: decimal;
        }
      `}</style>
    </div>
  )
}