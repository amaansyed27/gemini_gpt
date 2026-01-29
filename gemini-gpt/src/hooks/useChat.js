import { useState, useCallback, useEffect } from 'react';
import { streamGeminiResponse } from '../lib/gemini';

const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentModel, setCurrentModel] = useState("gemini-2.5-flash");
    const [error, setError] = useState(null);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('chat_history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse chat history");
            }
        }
    }, []);

    // Save to local storage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const sendMessage = useCallback(async (content, images = []) => {
        setIsLoading(true);
        setError(null);

        // Optimistic User Message
        const userMsg = { role: 'user', content, images }; // Store images for display
        setMessages(prev => [...prev, userMsg]);

        try {
            // Convert existing messages to Gemini history format
            // User: user, AI: model
            const history = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }] // Assuming text only history for now, need to handle images in history later
            }));

            // Temporary AI Message for streaming
            setMessages(prev => [...prev, { role: 'assistant', content: '', isThinking: true }]);

            let fullResponse = "";

            const result = await streamGeminiResponse(
                currentModel,
                history,
                content,
                images.map(img => ({ inlineData: { data: img.base64.split(',')[1], mimeType: img.mimeType } })),
                (text) => {
                    // Callback for streaming text responses (non-image models)
                    fullResponse = text;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            ...newMsgs[newMsgs.length - 1],
                            content: text,
                            isThinking: false
                        };
                        return newMsgs;
                    });
                }
            );

            // Handle media generation models which return data directly
            // This avoids stale closure issues with the callback
            if (result && result.isMediaGeneration) {
                console.log("useChat: Media generation result received, length:", result.content?.length);
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                        ...newMsgs[newMsgs.length - 1],
                        content: result.content,
                        isThinking: false
                    };
                    return newMsgs;
                });
                fullResponse = result.content;
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === 'assistant' && lastMsg.isThinking) {
                    lastMsg.content = "Error: " + err.message;
                    lastMsg.isThinking = false;
                    lastMsg.isError = true;
                }
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
        }
    }, [messages, currentModel]);

    return {
        messages,
        sendMessage,
        isLoading,
        currentModel,
        setCurrentModel,
        error
    };
};

export default useChat;
