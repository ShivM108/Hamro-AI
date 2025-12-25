import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import HamroLogo from './components/HamroLogo';
import { Menu, X, Key, ExternalLink, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Check if window.aistudio bridge is available and if key is selected
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for environments where the bridge isn't present but key might be in process.env
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Proceed immediately as per guidelines to avoid race conditions
      setHasKey(true);
    }
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#fbfbfa] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#e9e9e7] rounded-2xl shadow-sm p-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-50 rounded-2xl">
              <HamroLogo className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-[#37352f] mb-2">Welcome to Hamro AI</h1>
          <p className="text-[#6b6a67] mb-8 leading-relaxed">
            Your personal Himalayan-inspired assistant. Connect your Google Gemini API key to start writing, coding, and brainstorming.
          </p>

          <button 
            onClick={handleConnectKey}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group mb-4 shadow-lg shadow-purple-200"
          >
            <Key size={18} />
            Connect API Key
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#f1f1ef]">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#9B9A97] hover:text-[#37352f] flex items-center justify-center gap-1 transition-colors"
            >
              Learn about API billing <ExternalLink size={10} />
            </a>
            <p className="text-[10px] text-[#acaba9] uppercase tracking-widest font-bold">Powered by Gemini 3.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while checking key
  if (hasKey === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <HamroLogo className="w-8 h-8 text-purple-600 animate-pulse" />
      </div>
    );
  }

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