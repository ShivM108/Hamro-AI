import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Mobile Sidebar Toggle Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden absolute top-3 left-3 z-20">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-white rounded-md shadow border border-[#e9e9e7] text-[#37352f]"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
};

export default App;
