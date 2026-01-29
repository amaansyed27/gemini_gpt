import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Copy, Check, Sparkles, Image as ImageIcon, Video, Pencil, Trash2, RotateCcw, Download, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { useChatContext } from '../../context/ChatContext';

const MessageItem = ({ role, content, isThinking, isError, index, images }) => {
    const isUser = role === 'user';
    const { theme } = useTheme();
    const { deleteMessage, rollbackToMessage, editMessage, isLoading } = useChatContext();

    const isLightTheme = theme === THEMES.LIGHT || theme === THEMES.PAPER;

    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(content || '');

    // Copy text or download image
    const handleCopy = async () => {
        if (content?.includes('data:image/')) {
            // Download image
            const dataUrl = content.match(/data:image\/[^;]+;base64,[^)\s]+/)?.[0];
            if (dataUrl) {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `generated-image-${Date.now()}.png`;
                link.click();
            }
        } else {
            // Copy text
            await navigator.clipboard.writeText(content || '');
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        setEditText(content || '');
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (editText.trim() && editText !== content) {
            await editMessage(index, editText);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(content || '');
    };

    const handleDelete = () => {
        deleteMessage(index);
    };

    const handleRollback = () => {
        rollbackToMessage(index);
    };

    // Custom renderer for images
    const renderers = {
        img: ({ src, alt, ...props }) => {
            if (!src) return null;
            if (src.startsWith("data:video")) {
                return (
                    <div className="max-w-md my-4 rounded-xl overflow-hidden shadow-lg border border-white/10 relative group">
                        <video controls className="w-full h-auto bg-black" {...props}>
                            <source src={src} type={src.split(';')[0].replace('data:', '')} />
                        </video>
                    </div>
                );
            }
            return (
                <div className="max-w-md my-4 rounded-xl overflow-hidden shadow-lg border border-white/10">
                    <img src={src} alt={alt} className="w-full h-auto" {...props} />
                </div>
            );
        },
        p: ({ node, ...props }) => <div className="mb-2 last:mb-0" {...props} />
    };

    // Check if this is a generated image/video
    const isGeneratedImage = content?.includes('data:image/');
    const isGeneratedVideo = content?.includes('data:video/');

    return (
        <div className={cn(
            "group/msg w-full border-b border-black/5 dark:border-white/5 relative",
            isUser ? "bg-transparent" : "bg-main/50"
        )}>
            {/* Action buttons - show on hover */}
            {!isThinking && !isEditing && (
                <div className={cn(
                    "absolute top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1 z-10",
                    isUser ? "left-2" : "right-2"
                )}>
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "p-1.5 rounded-lg border text-text-secondary hover:text-text-primary transition-colors",
                            isLightTheme ? "bg-bg-sidebar/90 hover:bg-bg-sidebar border-black/10" : "bg-main/80 hover:bg-main border-white/10"
                        )}
                        title={isGeneratedImage ? "Download image" : "Copy text"}
                    >
                        {copied ? <Check size={14} /> : (isGeneratedImage ? <Download size={14} /> : <Copy size={14} />)}
                    </button>
                    {isUser && (
                        <button
                            onClick={handleEdit}
                            disabled={isLoading}
                            className={cn(
                                "p-1.5 rounded-lg border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50",
                                isLightTheme ? "bg-bg-sidebar/90 hover:bg-bg-sidebar border-black/10" : "bg-main/80 hover:bg-main border-white/10"
                            )}
                            title="Edit message"
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className={cn(
                            "p-1.5 rounded-lg border text-text-secondary hover:text-red-400 transition-colors disabled:opacity-50",
                            isLightTheme ? "bg-bg-sidebar/90 hover:bg-bg-sidebar border-black/10" : "bg-main/80 hover:bg-main border-white/10"
                        )}
                        title="Delete message"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button
                        onClick={handleRollback}
                        disabled={isLoading}
                        className={cn(
                            "p-1.5 rounded-lg border text-text-secondary hover:text-orange-400 transition-colors disabled:opacity-50",
                            isLightTheme ? "bg-bg-sidebar/90 hover:bg-bg-sidebar border-black/10" : "bg-main/80 hover:bg-main border-white/10"
                        )}
                        title="Delete all after this"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            )}

            <div className="text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 flex">
                <div className={cn("relative flex-shrink-0 flex flex-col items-end", isUser ? "order-2" : "order-1")}>
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                        isUser ? "bg-accent-color text-white" : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                    )}>
                        {isUser ? <User size={18} /> : <Sparkles size={16} />}
                    </div>
                </div>

                <div className={cn("relative flex-1 overflow-hidden", isUser ? "order-1 text-right" : "order-2 text-left")}>
                    {isUser && (
                        <div className="font-semibold text-sm text-text-primary mb-1">You</div>
                    )}
                    {!isUser && (
                        <div className="font-semibold text-sm text-text-primary mb-1 flex items-center gap-2">
                            Gemini
                            {theme === THEMES.LIQUID && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-color/10 text-accent-color font-medium border border-accent-color/20">AI</span>}
                        </div>
                    )}

                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-3 rounded-lg bg-main border border-white/10 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isLoading || !editText.trim()}
                                    className="px-3 py-1.5 rounded-lg bg-accent-color hover:bg-accent-color/80 text-white text-sm transition-colors disabled:opacity-50"
                                >
                                    Save & Regenerate
                                </button>
                            </div>
                        </div>
                    ) : isThinking ? (
                        <div className="flex items-center gap-2 h-7">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-accent-color rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-accent-color rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-accent-color rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-sm text-text-secondary animate-pulse">Generating Media...</span>
                        </div>
                    ) : (
                        <div className={cn(
                            "prose max-w-none leading-7 whitespace-pre-wrap",
                            theme === THEMES.LIGHT || theme === THEMES.PAPER ? "prose-zinc" : "prose-invert",
                            isError && "text-red-400"
                        )}>
                            {isGeneratedImage ? (
                                <div className="max-w-md my-4 rounded-xl overflow-hidden shadow-lg border border-white/10 relative group transition-transform hover:scale-[1.01]">
                                    <img
                                        src={content.match(/data:image\/[^;]+;base64,[^)\s]+/)?.[0]}
                                        alt="Generated Image"
                                        className="w-full h-auto"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <ImageIcon size={16} className="text-white" />
                                    </div>
                                </div>
                            ) : isGeneratedVideo ? (
                                <div className="max-w-md my-4 rounded-xl overflow-hidden shadow-lg border border-white/10 relative group">
                                    <video controls className="w-full h-auto bg-black">
                                        <source src={content.match(/data:video\/[^;]+;base64,[^)\s]+/)?.[0]} />
                                    </video>
                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <Video size={16} className="text-white" />
                                    </div>
                                </div>
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
                                    {content}
                                </ReactMarkdown>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;

