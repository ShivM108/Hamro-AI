import React from 'react';
import { Search, Home, Settings, Plus, MessageSquare, Clock, Star } from 'lucide-react';
import HamroLogo from './HamroLogo';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#f7f7f5] border-r border-[#e9e9e8] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col
      `}
    >
      {/* Workspace Switcher / Profile */}
      <div className="p-3 flex items-center gap-2 hover:bg-[#e9e9e7] m-2 rounded cursor-pointer transition-colors group">
        <div className="w-5 h-5 flex items-center justify-center">
            <HamroLogo className="w-5 h-5 text-purple-600" />
        </div>
        <span className="text-sm font-medium text-[#37352f] truncate">Hamro AI Workspace</span>
      </div>

      {/* Quick Actions */}
      <div className="px-2 mb-2">
        <div className="flex items-center gap-2 p-1.5 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Search size={16} />
           <span className="text-sm font-medium">Search</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Home size={16} />
           <span className="text-sm font-medium">Home</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Clock size={16} />
           <span className="text-sm font-medium">Inbox</span>
        </div>
      </div>

      {/* Favorites */}
      <div className="px-3 py-2">
        <div className="text-xs font-semibold text-[#9B9A97] mb-1">Favorites</div>
        <div className="flex items-center gap-2 p-1 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Star size={14} />
           <span className="text-sm truncate">Product Roadmap</span>
        </div>
        <div className="flex items-center gap-2 p-1 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Star size={14} />
           <span className="text-sm truncate">Meeting Notes</span>
        </div>
      </div>

      {/* Private Pages */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-[#9B9A97] mb-1 flex justify-between group">
           <span>Private</span>
           <Plus size={14} className="opacity-0 group-hover:opacity-100 cursor-pointer" />
        </div>
        <div className="flex items-center gap-2 p-1 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer bg-[#e9e9e7]">
           <MessageSquare size={14} />
           <span className="text-sm truncate">Hamro AI Chat</span>
        </div>
        <div className="flex items-center gap-2 p-1 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <span className="text-lg leading-none">📄</span>
           <span className="text-sm truncate">Drafts</span>
        </div>
         <div className="flex items-center gap-2 p-1 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <span className="text-lg leading-none">📄</span>
           <span className="text-sm truncate">Brainstorming</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#e9e9e8]">
         <div className="flex items-center gap-2 p-1.5 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Plus size={16} />
           <span className="text-sm font-medium">New Page</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 text-[#5f5e5b] hover:bg-[#e9e9e7] rounded cursor-pointer">
           <Settings size={16} />
           <span className="text-sm font-medium">Settings & members</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;