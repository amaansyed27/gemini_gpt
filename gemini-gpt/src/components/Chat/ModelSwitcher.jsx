import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Zap, Brain, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChatContext } from '../../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast & Intelligent (Recommended)', icon: Zap },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Complex Reasoning', icon: Brain },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Cost Effective', icon: Zap },
    { id: 'gemini-3-pro', name: 'Gemini 3 Pro (Preview)', description: 'Next-Gen Reasoning', icon: Sparkles },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash (Preview)', description: 'Next-Gen Speed', icon: Zap },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Image (Nano)', description: 'Image Generation', icon: ImageIcon },
    { id: 'veo-3.1-generate-preview', name: 'Veo 3.1 (Video)', description: 'Video Generation', icon: ImageIcon },
];

const ModelSwitcher = () => {
    const { currentModel, setCurrentModel } = useChatContext();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedModel = MODELS.find(m => m.id === currentModel) || MODELS[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (modelId) => {
        setCurrentModel(modelId);
        setIsOpen(false);
    };

    return (
        <div className="relative z-50 flex justify-center w-full pt-6 h-[68px]" ref={containerRef}>
            <motion.div
                layout
                initial={false}
                animate={{
                    width: isOpen ? 340 : 260,
                    height: isOpen ? 'auto' : 44,
                    borderRadius: isOpen ? 24 : 99,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8
                }}
                className={cn(
                    "flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl border border-white/10 z-50 origin-top",
                    isOpen ? "bg-[#1a1b1e] absolute top-6" : "bg-[#202123]/80 hover:bg-[#2A2B32] relative cursor-pointer"
                )}
            >
                {/* Header / Trigger - Using Grid for absolute stability */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "grid items-center w-full h-[44px] px-4 transition-colors cursor-pointer relative z-20",
                        isOpen ? "border-b border-white/5" : ""
                    )}
                    style={{
                        gridTemplateColumns: "1fr auto",
                        gridTemplateAreas: "'content chevron'"
                    }}
                >
                    {/* Content Area (Overlapping "Select Model" and Selected Model) */}
                    <div className="relative w-full h-full flex items-center" style={{ gridArea: "content" }}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            {/* Open State Label */}
                            {isOpen && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xs font-semibold text-gray-400 uppercase tracking-wider absolute left-0"
                                >
                                    Select Model
                                </motion.span>
                            )}

                            {/* Closed State Model Name */}
                            {!isOpen && (
                                <motion.div
                                    key="selected"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-center gap-2 w-full absolute inset-0"
                                >
                                    <div className={cn("transition-transform duration-300", isOpen ? "scale-0 w-0" : "scale-100")}>
                                        {selectedModel.id.includes('pro') ? <Brain size={18} className="text-purple-400" /> :
                                            selectedModel.id.includes('gemini-3') ? <Sparkles size={18} className="text-amber-400" /> :
                                                selectedModel.id.includes('preview') || selectedModel.id.includes('image') || selectedModel.id.includes('video') ? <ImageIcon size={18} className="text-pink-400" /> :
                                                    <Zap size={18} className="text-yellow-400" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-200 truncate max-w-[170px]">
                                        {selectedModel.name}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Chevron - Always on right */}
                    <div style={{ gridArea: "chevron" }} className="text-gray-500 flex-shrink-0 ml-2">
                        {isOpen ? (
                            <div className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors"><ChevronDown size={14} className="rotate-180" /></div>
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </div>
                </div>

                {/* List Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-1 p-2 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar"
                        >
                            {MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => handleSelect(model.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl text-left transition-colors relative group w-full flex-shrink-0",
                                        currentModel === model.id ? "bg-white/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-xl bg-black/40 border border-white/5 flex-shrink-0",
                                        currentModel === model.id ? "text-accent-color shadow-glow" : "text-gray-400 group-hover:text-gray-300"
                                    )}>
                                        <model.icon size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className={cn(
                                            "text-sm font-semibold truncate",
                                            currentModel === model.id ? "text-white" : "text-gray-300"
                                        )}>
                                            {model.name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-0.5">
                                            {model.description}
                                        </div>
                                    </div>

                                    {currentModel === model.id && (
                                        <div className="text-accent-color pr-2">
                                            <Check size={18} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ModelSwitcher;
