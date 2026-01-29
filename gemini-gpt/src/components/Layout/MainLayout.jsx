import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChatContext } from '../../context/ChatContext';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { startNewChat } = useChatContext();

    return (
        <div className="flex h-screen overflow-hidden text-primary bg-main transition-colors duration-500">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className="flex-1 flex flex-col h-full relative">
                {/* Mobile Header */}
                <div className="flex items-center p-2 text-gray-500 glass-panel border-b border-white/5 md:hidden">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-md text-primary">
                        <Menu />
                    </button>
                    <div className="flex-1 text-center font-normal px-4 truncate text-primary">New chat</div>
                    <button onClick={startNewChat} className="p-2 hover:bg-white/10 rounded-md text-primary">
                        <Plus />
                    </button>
                </div>

                <main className="flex-1 overflow-hidden relative w-full h-full">
                    {children}
                </main>
            </div>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default MainLayout;
