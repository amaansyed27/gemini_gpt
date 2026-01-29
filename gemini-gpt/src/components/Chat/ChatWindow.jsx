import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import InputArea from './InputArea';
import ModelSwitcher from './ModelSwitcher';
import { useChatContext } from '../../context/ChatContext';
import { Sparkles } from 'lucide-react';

const ChatWindow = () => {
    const { messages, isLoading, error, sendMessage, currentModel, setCurrentModel } = useChatContext();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full relative">
            <ModelSwitcher currentModel={currentModel} onModelChange={setCurrentModel} />

            <div className="flex-1 overflow-y-auto pb-40 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-primary px-4">
                        <div className="bg-bg-sidebar p-4 rounded-2xl mb-6 shadow-xl border border-white/5 animate-in fade-in zoom-in duration-500">
                            <Sparkles size={48} className="text-accent-color" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Welcome to Gemini GPT</h2>
                        <p className="text-text-secondary text-center max-w-md">
                            Experience the power of Google's Gemini Models. Ask me anything, or upload an image to get started.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {messages.map((msg, index) => (
                            <MessageItem key={index} index={index} {...msg} />
                        ))}
                        {error && (
                            <div className="p-4 mx-auto max-w-3xl w-full text-red-400 bg-red-900/10 border border-red-500/20 rounded-md my-2 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <InputArea onSend={sendMessage} disabled={isLoading} />
        </div>
    );
};

export default ChatWindow;
