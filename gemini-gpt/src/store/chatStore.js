import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useChatStore = create(
    persist(
        (set, get) => ({
            // State
            messages: [],
            chatHistory: [],
            activeChatId: null,
            currentModel: 'gemini-2.5-flash',
            isLoading: false,
            error: null,

            // Actions
            setMessages: (messages) => set({ messages }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            setCurrentModel: (currentModel) => set({ currentModel }),
            setActiveChatId: (activeChatId) => set({ activeChatId }),

            startNewChat: () => {
                set({
                    messages: [],
                    activeChatId: generateId(),
                    error: null
                });
            },

            loadChat: (chatId) => {
                const { chatHistory } = get();
                const chat = chatHistory.find(c => c.id === chatId);
                if (chat) {
                    set({
                        messages: chat.messages,
                        activeChatId: chatId,
                        error: null
                    });
                }
            },

            clearHistory: () => {
                set({
                    chatHistory: [],
                    messages: [],
                    activeChatId: generateId()
                });
            },

            deleteChat: (chatId) => {
                const { chatHistory, activeChatId, startNewChat } = get();
                set({ chatHistory: chatHistory.filter(c => c.id !== chatId) });
                if (activeChatId === chatId) {
                    get().startNewChat();
                }
            },

            deleteMessage: (index) => {
                const { messages, chatHistory, activeChatId } = get();
                const newMsgs = messages.filter((_, i) => i !== index);

                // Update chat history
                const updatedHistory = chatHistory.map(chat =>
                    chat.id === activeChatId
                        ? { ...chat, messages: newMsgs }
                        : chat
                );

                set({ messages: newMsgs, chatHistory: updatedHistory });
            },

            rollbackToMessage: (index) => {
                const { messages, chatHistory, activeChatId } = get();
                const newMsgs = messages.slice(0, index);

                const updatedHistory = chatHistory.map(chat =>
                    chat.id === activeChatId
                        ? { ...chat, messages: newMsgs }
                        : chat
                );

                set({ messages: newMsgs, chatHistory: updatedHistory });
            },

            updateChatHistory: (updatedMessages, content) => {
                const { chatHistory, activeChatId } = get();
                let currentChatId = activeChatId;

                if (!currentChatId) {
                    currentChatId = generateId();
                    set({ activeChatId: currentChatId });
                }

                const existingIndex = chatHistory.findIndex(c => c.id === currentChatId);
                const title = chatHistory.find(c => c.id === currentChatId)?.title ||
                    content.split(' ').slice(0, 6).join(' ') + '...';

                const newChatEntry = {
                    id: currentChatId,
                    title,
                    messages: updatedMessages,
                    timestamp: Date.now()
                };

                let newHistory;
                if (existingIndex >= 0) {
                    newHistory = [...chatHistory];
                    newHistory.splice(existingIndex, 1);
                    newHistory.unshift(newChatEntry);
                } else {
                    newHistory = [newChatEntry, ...chatHistory];
                }

                set({ chatHistory: newHistory });
            },

            initChat: () => {
                const { activeChatId, messages } = get();
                if (!activeChatId && messages.length === 0) {
                    set({ activeChatId: generateId() });
                }
            }
        }),
        {
            name: 'gemini-chat-storage',
            partialize: (state) => ({
                chatHistory: state.chatHistory,
                currentModel: state.currentModel
                // Don't persist: messages (loaded from chatHistory), isLoading, error
            })
        }
    )
);
