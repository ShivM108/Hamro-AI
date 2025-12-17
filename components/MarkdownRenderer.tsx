import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content text-[#37352f] text-[16px] leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-5 mb-2 border-b border-[#e9e9e7] pb-1" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-1" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[#37352f] pl-4 italic text-gray-600 my-4" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            return inline ? (
              <code className="bg-[#f2f0eb] text-[#eb5757] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-[#f7f6f3] p-4 rounded-md overflow-x-auto my-4 text-sm font-mono text-[#37352f]">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          a: ({ node, ...props }) => (
            <a className="text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-gray-800 transition-colors" {...props} />
          ),
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4 border border-[#e9e9e7] rounded-sm">
                <table className="min-w-full divide-y divide-[#e9e9e7]" {...props} />
            </div>
          ),
          th: ({node, ...props}) => (
            <th className="bg-[#f7f6f3] px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-[#e9e9e7] last:border-r-0" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="px-3 py-2 whitespace-nowrap text-sm text-[#37352f] border-r border-[#e9e9e7] last:border-r-0 border-t" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
