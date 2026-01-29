import React, { useRef, useState } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme, THEMES } from '../../context/ThemeContext';

const InputArea = ({ onSend, disabled }) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [input, setInput] = useState('');
    const [images, setImages] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const { theme } = useTheme();

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if ((!input.trim() && images.length === 0) || disabled) return;
        onSend(input, images);
        setInput('');
        setImages([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, {
                    base64: reader.result,
                    mimeType: file.type,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
        // Reset input
        e.target.value = null;
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="absolute bottom-0 left-0 w-full pt-10 pb-6 px-4 pointer-events-none">
            {/* Gradient fade for content below */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main to-transparent -z-10" />

            <div className="max-w-3xl mx-auto pointer-events-auto">
                {images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mb-3 p-2 animate-in slide-in-from-bottom-2 fade-in">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group flex-shrink-0">
                                <img src={img.base64} alt={img.name} className="h-16 w-16 object-cover rounded-xl border border-white/10 shadow-lg" />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute -top-1 -right-1 bg-black/50 backdrop-blur-md text-white rounded-full p-1 shadow-md hover:bg-black/80 transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    className={cn(
                        "relative transition-all duration-300 ease-out",
                        isFocused ? "scale-[1.01]" : "scale-100",
                        theme === THEMES.LIQUID ? "liquid-border p-[1px]" : ""
                    )}
                >
                    <div className={cn(
                        "relative flex items-end w-full p-3 rounded-2xl border shadow-xl overflow-hidden z-10",
                        "glass-panel transition-colors duration-300",
                        isFocused ? "border-accent-color/50 ring-1 ring-accent-color/20" : "border-white/10"
                    )}>
                        <button
                            className="p-2 mr-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-white/5 rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                        />

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className="w-full max-h-[200px] py-2 bg-transparent text-text-primary border-none resize-none focus:ring-0 focus:outline-none scrollbar-hide placeholder-text-secondary/50 font-normal leading-relaxed"
                            placeholder={disabled ? "Gemini is thinking..." : "Message Gemini..."}
                            value={input}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => {
                                setInput(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                        />

                        <button
                            className={cn(
                                "p-2 ml-2 transition-all duration-300 rounded-xl flex items-center justify-center",
                                (!input.trim() && images.length === 0) || disabled
                                    ? "bg-transparent text-text-secondary/30"
                                    : "bg-accent-color text-white shadow-[0_0_10px_rgba(var(--accent-color),0.5)] scale-100"
                            )}
                            disabled={disabled || (!input.trim() && images.length === 0)}
                            onClick={handleSend}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                <div className="text-center text-[10px] md:text-xs text-text-secondary mt-3 opacity-60 font-medium">
                    Gemini may display inaccurate info, including about people, so double-check its responses.
                </div>
            </div>
        </div>
    );
};

export default InputArea;
