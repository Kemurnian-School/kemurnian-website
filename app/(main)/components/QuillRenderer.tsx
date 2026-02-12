import sanitizeHtml from 'sanitize-html';
import './QuillRenderer.css';

interface QuillRendererProps {
  content: string;
  className?: string;
}

function processQuillHTML(html: string): string {
  html = html.replace(/<ol>/g, '<ul>');
  html = html.replace(/<\/ol>/g, '</ul>');
  html = html.replace(/data-list="bullet"/g, 'data-list-type="bullet"');
  html = html.replace(/data-list="ordered"/g, 'data-list-type="ordered"');
  html = html.replace(/<li[^>]*>\s*<p>/g, '<li>');
  html = html.replace(/<\/p>\s*<\/li>/g, '</li>');
  html = html.replace(/<span class="ql-ui"[^>]*><\/span>/g, '');
  return html;
}

export default function QuillRenderer({ content, className = '' }: QuillRendererProps) {
  if (!content) return null;

  const processed = processQuillHTML(content);

  const cleanContent = sanitizeHtml(processed, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'u', 'span', 'div'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class', 'data-list-type'],
      'img': ['src', 'width', 'height', 'alt']
    },
    allowedSchemes: ['http', 'https', 'data']
  });

  return (
    <div className={`quill-renderer ${className}`}>
      <div
        dangerouslySetInnerHTML={{ __html: cleanContent }}
        className="quill-content"
      />
    </div>
  );
}
