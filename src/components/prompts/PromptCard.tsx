import { useState } from 'react';
import {
  Star,
  Copy,
  Check,
  Edit2,
  Trash2,
  CopyPlus,
  Calendar,
  Folder,
} from 'lucide-react';
import { Prompt } from '../../types/database';
import { Badge } from '../common/Badge';

export interface PromptCardProps {
  prompt: Prompt;
  isAdmin?: boolean;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (content: string) => Promise<boolean>;
}

export function PromptCard({
  prompt,
  isAdmin = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onDuplicate,
  onCopy,
}: PromptCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (isCopying) return;
    setIsCopying(true);
    const success = await onCopy(prompt.content);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
    setIsCopying(false);
  };

  const formattedDate = new Date(prompt.created_at || Date.now()).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <article
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
      aria-labelledby={`prompt-title-${prompt.id}`}
    >
      <div>
        {/* Top Header: Title, Category, and Star */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3
              id={`prompt-title-${prompt.id}`}
              className="text-base font-semibold text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-1 break-words"
              title={prompt.title}
            >
              {prompt.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {prompt.category ? (
                <Badge variant="brand" size="sm" className="gap-1 font-medium">
                  <Folder className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{prompt.category.name}</span>
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  Uncategorized
                </Badge>
              )}

              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={() => onToggleFavorite(prompt.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50/50 transition-colors shrink-0"
            aria-label={
              prompt.is_favorite
                ? `Remove ${prompt.title} from favorites`
                : `Add ${prompt.title} to favorites`
            }
          >
            <Star
              className={`w-4 h-4 ${
                prompt.is_favorite
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300 group-hover:text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Content Preview (Raw plain text with whitespace preview preserved, no HTML injection) */}
        <div className="my-3.5 p-3 rounded-lg bg-slate-50/90 border border-slate-100 text-xs font-mono text-slate-700 max-h-32 overflow-hidden relative select-text leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 line-clamp-4 break-words">
            {prompt.content}
          </pre>
        </div>
      </div>

      {/* Footer: Date & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={isCopying}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            aria-label={`Copy prompt: ${prompt.title}`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Owner Only Actions */}
          {isAdmin && (
            <>
              {/* Duplicate Button */}
              <button
                type="button"
                onClick={() => onDuplicate(prompt.id)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Duplicate prompt"
                aria-label={`Duplicate ${prompt.title}`}
              >
                <CopyPlus className="w-4 h-4" />
              </button>

              {/* Edit Button */}
              <button
                type="button"
                onClick={() => onEdit(prompt)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit prompt"
                aria-label={`Edit ${prompt.title}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Delete Button with inline confirmation step */}
              {isConfirmingDelete ? (
                <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-medium px-1">Delete?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(prompt.id)}
                    className="text-[11px] bg-rose-600 text-white px-2 py-0.5 rounded font-medium hover:bg-rose-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 px-1.5 py-0.5 rounded"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete prompt"
                  aria-label={`Delete ${prompt.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
