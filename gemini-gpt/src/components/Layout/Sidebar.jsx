import React, { useState } from 'react';
import { Plus, MessageSquare, LogOut, Settings, ChevronLeft, ChevronRight, Moon, Sun, Monitor, Droplets, Trash2, Layout, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { useChatContext } from '../../context/ChatContext';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
    const { chatHistory, startNewChat, loadChat, activeChatId, clearHistory, deleteChat } = useChatContext();
    const { theme, setTheme } = useTheme();
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    // Light themes need dark text, dark themes need light text
    const isLightTheme = theme === THEMES.LIGHT || theme === THEMES.PAPER;

    const ThemeIcon = () => {
        switch (theme) {
            case THEMES.LIGHT: return <Sun size={16} />;
            case THEMES.PAPER: return <Layout size={16} />;
            case THEMES.LIQUID: return <Droplets size={16} />;
            default: return <Moon size={16} />;
        }
    };

    return (
        <div
            className={cn(
                "flex-shrink-0 flex flex-col h-screen transition-all duration-300 ease-in-out z-50",
                "glass-panel border-r sidebar-panel",
                isLightTheme ? "border-black/10 bg-bg-sidebar" : "border-white/5",
                isOpen ? "translate-x-0" : "-translate-x-full absolute md:relative md:translate-x-0",
                isCollapsed ? "w-[60px]" : "w-[260px]"
            )}
        >
            <div className="p-3 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {/* New Chat Button */}
                <button
                    onClick={startNewChat}
                    className={cn(
                        "flex items-center gap-3 transition-all duration-200 cursor-pointer text-sm rounded-xl mb-6 flex-shrink-0",
                        isLightTheme
                            ? "text-text-primary border border-black/10 hover:bg-black/5"
                            : "text-text-primary border border-white/10 hover:bg-white/10",
                        isCollapsed ? "justify-center h-10 w-10 p-0" : "py-3 px-3 w-full"
                    )}
                >
                    <Plus size={16} />
                    {!isCollapsed && <span>New chat</span>}
                </button>

                {/* History List */}
                {!isCollapsed && (
                    <div className="flex flex-col gap-2 py-2 animate-in fade-in duration-300">
                        <div className="text-xs font-medium text-text-secondary px-3 uppercase tracking-wider mb-2">Recent</div>
                        {chatHistory.length === 0 && (
                            <div className="text-sm text-text-secondary px-3 italic">No recent chats</div>
                        )}
                        {chatHistory.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => loadChat(chat.id)}
                                className={cn(
                                    "flex py-3 px-3 items-center gap-3 relative rounded-lg cursor-pointer break-all group transition-all duration-200",
                                    activeChatId === chat.id
                                        ? (isLightTheme ? "bg-black/10 text-text-primary" : "bg-white/10 text-text-primary")
                                        : (isLightTheme ? "text-text-secondary hover:bg-black/5 hover:text-text-primary" : "text-text-secondary hover:bg-white/5 hover:text-text-primary")
                                )}
                            >
                                <MessageSquare size={16} className={cn("flex-shrink-0", activeChatId === chat.id ? "text-accent-color" : "")} />
                                <div className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden relative text-sm text-left">
                                    {chat.title}
                                </div>
                                <div
                                    onClick={(e) => deleteChat(chat.id, e)}
                                    className={cn(
                                        "opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity absolute right-2 pl-4",
                                        isLightTheme ? "bg-gradient-to-l from-bg-sidebar to-transparent" : "bg-gradient-to-l from-[#202123] to-transparent"
                                    )}
                                >
                                    <Trash2 size={14} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Collapse Toggle */}
            <div className="hidden md:flex justify-end p-2">
                <button
                    onClick={toggleCollapse}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isLightTheme
                            ? "text-text-secondary hover:text-text-primary hover:bg-black/10"
                            : "text-text-secondary hover:text-text-primary hover:bg-white/10"
                    )}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Footer Controls */}
            <div className={cn("border-t p-2 space-y-1", isLightTheme ? "border-black/10" : "border-white/10")}>
                {/* Clear History */}
                {!isCollapsed && (
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear all history?")) {
                                clearHistory();
                            }
                        }}
                        className="flex w-full py-2.5 px-3 items-center gap-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-text-secondary transition-colors duration-200 text-sm"
                    >
                        <Trash2 size={16} />
                        <span>Clear conversations</span>
                    </button>
                )}

                {/* Theme Switcher */}
                <div className="relative">
                    <button
                        onClick={() => !isCollapsed && setShowThemeMenu(!showThemeMenu)}
                        className={cn(
                            "flex items-center gap-3 rounded-lg transition-colors duration-200 text-text-primary cursor-pointer text-sm w-full",
                            isLightTheme ? "hover:bg-black/5" : "hover:bg-white/10",
                            isCollapsed ? "justify-center h-10 w-10 p-0" : "py-3 px-3"
                        )}
                    >
                        <ThemeIcon />
                        {!isCollapsed && <span className="flex-1 text-left capitalize">{theme} Mode</span>}
                        {!isCollapsed && <Settings size={16} className="text-text-secondary" />}
                    </button>

                    {/* Theme Popup Menu */}
                    {showThemeMenu && !isCollapsed && (
                        <div className={cn(
                            "absolute bottom-full left-0 w-full mb-2 border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in",
                            isLightTheme ? "bg-bg-sidebar border-black/10" : "bg-[#1a1b1e] border-white/10"
                        )}>
                            {Object.values(THEMES).map(t => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setTheme(t);
                                        setShowThemeMenu(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors capitalize",
                                        isLightTheme ? "hover:bg-black/5" : "hover:bg-white/5",
                                        theme === t ? "text-accent-color font-medium" : "text-text-secondary"
                                    )}
                                >
                                    {t === THEMES.LIGHT && <Sun size={14} />}
                                    {t === THEMES.DARK && <Moon size={14} />}
                                    {t === THEMES.PAPER && <Layout size={14} />}
                                    {t === THEMES.LIQUID && <Droplets size={14} />}
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

