import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { streamGeminiResponse } from '../lib/gemini';
import { useChatStore } from '../store/chatStore';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // Get state and actions from Zustand store
    const {
        messages, setMessages,
        chatHistory,
        activeChatId, setActiveChatId,
        currentModel, setCurrentModel,
        isLoading, setIsLoading,
        error, setError,
        startNewChat,
        loadChat,
        clearHistory,
        deleteChat,
        deleteMessage,
        rollbackToMessage,
        updateChatHistory,
        initChat
    } = useChatStore();

    // Init a new chat if none exists on load
    useEffect(() => {
        initChat();
    }, [initChat]);

    const sendMessage = useCallback(async (content, images = []) => {
        if (!content.trim() && images.length === 0) return;

        setIsLoading(true);
        setError(null);

        const userMsg = { role: 'user', content, images };
        let updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        // Ensure we have a chat ID
        let currentChatId = activeChatId;
        if (!currentChatId) {
            currentChatId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            setActiveChatId(currentChatId);
        }

        try {
            const apiHistory = updatedMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Add thinking message
            setMessages([...updatedMessages, { role: 'assistant', content: '', isThinking: true }]);

            let fullResponse = "";

            const result = await streamGeminiResponse(
                currentModel,
                apiHistory,
                content,
                images.map(img => ({ inlineData: { data: img.base64.split(',')[1], mimeType: img.mimeType } })),
                (text) => {
                    fullResponse = text;
                    const newMsgs = [...updatedMessages, {
                        role: 'assistant',
                        content: text,
                        isThinking: false
                    }];
                    setMessages(newMsgs);
                    updatedMessages = newMsgs;
                }
            );

            // Handle media generation
            if (result && result.isMediaGeneration) {
                fullResponse = result.content;
                const newMsgs = [...updatedMessages];
                newMsgs[newMsgs.length - 1] = {
                    ...newMsgs[newMsgs.length - 1],
                    content: result.content,
                    isThinking: false
                };
                setMessages(newMsgs);
                updatedMessages = newMsgs;
            }

            // Update chat history in store
            updateChatHistory(updatedMessages, content);

        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
            const currentMsgs = useChatStore.getState().messages;
            const lastMsg = currentMsgs[currentMsgs.length - 1];
            if (lastMsg?.isThinking) {
                setMessages(currentMsgs.map((msg, i) =>
                    i === currentMsgs.length - 1
                        ? { ...msg, content: "Error: " + err.message, isThinking: false, isError: true }
                        : msg
                ));
            }
        } finally {
            setIsLoading(false);
        }
    }, [messages, currentModel, activeChatId, setMessages, setIsLoading, setError, setActiveChatId, updateChatHistory]);

    // Edit message and regenerate
    const editMessage = useCallback(async (index, newContent) => {
        const prevMessages = messages.slice(0, index);
        setMessages(prevMessages);

        const originalMsg = messages[index];
        const images = originalMsg?.images || [];

        await sendMessage(newContent, images);
    }, [messages, sendMessage, setMessages]);

    return (
        <ChatContext.Provider value={{
            messages,
            sendMessage,
            isLoading,
            currentModel,
            setCurrentModel,
            error,
            chatHistory,
            startNewChat,
            loadChat,
            activeChatId,
            clearHistory,
            deleteChat,
            deleteMessage,
            rollbackToMessage,
            editMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => useContext(ChatContext);
