import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FormattedOutput({ text, emptyText }) {
  const value = (text || "").toString().trim();

  if (!value) {
    return <p className="text-sm text-slate-400 italic">{emptyText}</p>;
  }

  return (
    <div className="prose prose-sm max-w-none prose-slate">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-lg font-black text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-md font-bold text-slate-800 mt-4 mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-700 mt-3 mb-1" {...props} />,
          p: ({node, ...props}) => <p className="text-sm leading-7 text-slate-600 mb-3" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4 text-sm text-slate-600" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-sm text-slate-600" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-slate-500 my-4" {...props} />,
          code: ({node, inline, ...props}) => (
            inline 
              ? <code className="bg-slate-100 px-1 rounded text-emerald-600 font-mono text-xs" {...props} />
              : <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-auto my-4 text-xs font-mono" {...props} />
          )
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
