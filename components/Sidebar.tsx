import React from 'react';
import { Plus, MessageSquare, MoreHorizontal, User as UserIcon, LogOut } from 'lucide-react';
import { ChatSession, ThemeConfig, User } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  user: User;
  onLogout: () => void;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  user,
  onLogout,
  theme,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / New Chat */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-3 transition-colors shadow-sm group`}
          >
            <div className={`p-1 rounded-md ${theme.iconBg} ${theme.iconText} group-hover:scale-110 transition-transform`}>
              <Plus className="w-5 h-5" />
            </div>
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your chats</h3>
          
          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-500 italic">
              No chat history yet
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="group relative">
                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full text-left py-3 px-3 rounded-lg flex items-center gap-3 transition-colors ${
                    currentSessionId === session.id
                      ? `${theme.lightBg} ${theme.primaryText}`
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? theme.primaryText : 'text-slate-400'}`} />
                  <span className="truncate text-sm font-medium">{session.title || 'New Chat'}</span>
                </button>
                
                {/* Delete button (visible on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete chat"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
              {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                 <UserIcon className="w-full h-full p-2 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5">
                 <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Free Plan</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
              <button 
                onClick={() => {}} // Placeholder for upgrade
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-white ${theme.accentBg} ${theme.accentBgHover} transition-colors shadow-sm`}
              >
                Upgrade
              </button>
              <button 
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-700"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Helper icon component since X is imported as XIcon in Sidebar to avoid conflict if I used X
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default Sidebar;