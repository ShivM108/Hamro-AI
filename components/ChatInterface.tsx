import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, ChevronDown, MoreHorizontal, Trash2, Settings, AlertCircle, RefreshCw, LayoutList, X, Plus, FileText, File, Folder, Paperclip, Key } from 'lucide-react';
import { Message, LoadingState, Attachment } from '../types';
import { sendMessage, summarizeConversation, AVAILABLE_MODELS, clearHistory } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import HamroLogo from './HamroLogo';
import * as mammoth from 'mammoth';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'intro',
        role: 'model',
        content: "Hi! Buddy, I'm Hamro AI. You can ask me to write code, analyze PDFs, or help with your notes. I support uploading files and folders now!",
        timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // File upload state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue, attachments]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsReadingFiles(true);
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      try {
        if (extension === 'pdf') {
          const b64 = await fileToBase64(file);
          newAttachments.push({
            name: file.name,
            mimeType: 'application/pdf',
            data: b64,
            isInline: true
          });
        } else if (extension === 'docx' || extension === 'doc') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          newAttachments.push({
            name: file.name,
            mimeType: 'text/plain',
            data: result.value,
            isInline: false
          });
        } else {
          const text = await file.text();
          newAttachments.push({
            name: file.name,
            mimeType: 'text/plain',
            data: text,
            isInline: false
          });
        }
      } catch (err) {
        console.error("Failed to read file:", file.name, err);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsReadingFiles(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleSend = async (overrideValue?: string) => {
    const valueToUse = overrideValue || inputValue;
    if ((!valueToUse.trim() && attachments.length === 0) || loadingState !== LoadingState.IDLE) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: valueToUse.trim() || (attachments.length > 0 ? `Sent ${attachments.length} files` : ''),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    if (!overrideValue) {
      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    
    setLoadingState(LoadingState.THINKING);

    try {
      const responseText = await sendMessage(userMsg.content, selectedModel, userMsg.attachments);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorText = error.message || "";
      let friendlyMsg = "An unexpected error occurred.";
      let isKeyError = false;

      if (errorText.includes("KEY_CONFIG_ERROR") || errorText.includes("AUTH_ERROR")) {
        friendlyMsg = "It looks like there's an issue with your API key configuration. Ensure your selected project has billing enabled and the Gemini API is active.";
        isKeyError = true;
      } else if (errorText.includes("QUOTA_ERROR")) {
        friendlyMsg = "You've reached your API quota. Please try again in a few moments.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: friendlyMsg,
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleSummarize = async () => {
    setIsHeaderMenuOpen(false);
    if (messages.length <= 1) return;
    setIsSummarizing(true);
    try {
        const result = await summarizeConversation(messages);
        setSummary(result);
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
        id: 'intro',
        role: 'model',
        content: "Hi Buddy, I'm Hamro AI. Ask me anything!",
        timestamp: new Date()
    }]);
    setSummary(null);
    clearHistory();
    setIsHeaderMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-12 border-b border-[#e9e9e7] flex items-center px-4 justify-between sticky top-0 bg-white z-10 lg:pl-4 pl-14 transition-all">
        <div className="flex items-center gap-2">
            <HamroLogo className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-sm text-[#37352f]">Hamro AI</span>
        </div>
        
        <div className="flex items-center gap-2">
            {isSummarizing && (
                <div className="flex items-center gap-2 px-2 py-1 bg-purple-50 rounded animate-pulse">
                    <RefreshCw size={12} className="animate-spin text-purple-600" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase">Summarizing...</span>
                </div>
            )}
            
            <div className="relative">
                <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    className="flex items-center justify-center rounded-md text-[#37352f] hover:bg-[#efefed] h-8 w-8"
                >
                    <MoreHorizontal size={18} />
                </button>

                {isHeaderMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMenuOpen(false)} />
                        <div className="absolute right-0 top-full z-50 flex flex-col bg-white border border-[#e9e9e7] shadow-lg mt-2 w-56 rounded-lg py-1.5 animate-in fade-in zoom-in-95 duration-100">
                             <button onClick={handleSummarize} className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-[#37352f] hover:bg-[#efefed]">
                                <LayoutList size={16} /> Summarize chat
                             </button>
                             <button onClick={handleUpdateKey} className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-[#37352f] hover:bg-[#efefed]">
                                <Key size={16} /> Change API Key
                             </button>
                             <button onClick={handleClearChat} className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-[#37352f] hover:bg-[#efefed]">
                                <Trash2 size={16} /> Clear history
                             </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {summary && (
            <div className="mb-8 p-6 bg-[#f6f3f9] border border-[#e8dfef] rounded-lg relative">
                <button onClick={() => setSummary(null)} className="absolute top-4 right-4 text-purple-400 hover:text-purple-600">
                    <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <HamroLogo className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 uppercase">Summary</span>
                </div>
                <MarkdownRenderer content={summary} />
            </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded shadow-sm bg-white border border-[#e9e9e7] flex items-center justify-center shrink-0 mt-1">
                <HamroLogo className="w-5 h-5 text-purple-600" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="text-xs text-gray-400 mb-1 px-1">
                  {msg.role === 'user' ? 'You' : 'Hamro AI'}
                </div>
                
                <div className={`py-3 px-4 rounded-lg text-[15px] ${msg.role === 'user' ? 'bg-[#f7f7f5] text-[#37352f]' : 'bg-transparent text-[#37352f] w-full'} ${msg.isError ? 'bg-red-50 text-red-800 border border-red-200 shadow-sm' : ''}`}>
                    <MarkdownRenderer content={msg.content} />
                    
                    {msg.isError && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button 
                          onClick={() => {
                            const lastUser = [...messages].reverse().find(m => m.role === 'user');
                            if (lastUser) handleSend(lastUser.content);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-xs font-semibold transition-colors"
                        >
                          <RefreshCw size={14} /> Retry Message
                        </button>
                        <button 
                          onClick={handleUpdateKey}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-md text-xs font-semibold transition-colors"
                        >
                          <Key size={14} /> Re-configure API Key
                        </button>
                      </div>
                    )}

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.attachments.map((at, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-white border border-[#e9e9e7] px-2 py-1 rounded text-[11px] font-medium text-gray-600">
                            {at.mimeType === 'application/pdf' ? <FileText size={12} className="text-red-500" /> : <File size={12} className="text-blue-500" />}
                            {at.name}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                <User size={18} className="text-gray-500" />
              </div>
            )}
          </div>
        ))}

        {loadingState !== LoadingState.IDLE && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded shadow-sm bg-white border border-[#e9e9e7] flex items-center justify-center shrink-0">
               <HamroLogo className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <div className="flex items-center h-8">
                <span className="text-sm text-gray-500 animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:px-8 sm:pb-8 bg-white">
        <div className="relative border border-[#e9e9e7] rounded-xl shadow-sm bg-white focus-within:ring-1 focus-within:ring-[#d3d1cb] transition-all">
          
          {/* File Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 pb-0">
              {attachments.map((at, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-[#f1f1ef] px-2 py-1 rounded-md text-xs font-medium text-[#37352f] border border-transparent hover:border-gray-300 group">
                  {at.mimeType === 'application/pdf' ? <FileText size={14} className="text-red-500" /> : <File size={14} className="text-blue-500" />}
                  <span className="max-w-[120px] truncate">{at.name}</span>
                  <button onClick={() => removeAttachment(idx)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {isReadingFiles && (
                <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse px-2 py-1">
                  <RefreshCw size={12} className="animate-spin" />
                  Reading...
                </div>
              )}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI or drop files here..."
            className="w-full max-h-[200px] pt-3 pb-12 pl-4 pr-12 bg-transparent resize-none outline-none text-[#37352f] placeholder-gray-400 min-h-[80px]"
            rows={1}
            disabled={loadingState !== LoadingState.IDLE}
          />
          
          {/* Action Bar */}
          <div className="absolute left-3 bottom-2 flex items-center gap-1">
            <div className="relative">
              <button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#37352f] hover:bg-[#efefed] px-2 py-1.5 rounded transition-colors"
              >
                <Sparkles size={12} className={selectedModel === 'gemini-3-pro-preview' ? 'text-purple-600' : 'text-gray-400'} />
                <span>{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name.split(' ')[2]}</span>
                <ChevronDown size={12} className="opacity-70" />
              </button>
              
              {isModelDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsModelDropdownOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-1 w-56 bg-white border border-[#e9e9e7] rounded-lg shadow-xl overflow-hidden py-1.5 z-50">
                    {AVAILABLE_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f7f7f5] flex flex-col gap-0.5 ${selectedModel === model.id ? 'bg-[#f7f7f5]' : ''}`}
                      >
                        <span className={`font-semibold ${selectedModel === model.id ? 'text-purple-600' : 'text-[#37352f]'}`}>{model.name}</span>
                        <span className="text-[10px] text-gray-400 leading-tight">{model.description}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
            <input type="file" ref={folderInputRef} className="hidden" webkitdirectory="" mozdirectory="" directory="" onChange={handleFileChange} />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-[#37352f] hover:bg-[#efefed] rounded transition-colors"
              title="Upload files"
            >
              <Paperclip size={14} />
            </button>
            <button 
              onClick={() => folderInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-[#37352f] hover:bg-[#efefed] rounded transition-colors"
              title="Upload folder"
            >
              <Folder size={14} />
            </button>
          </div>

          <div className="absolute right-2 bottom-2">
            <button
              onClick={() => handleSend()}
              disabled={(!inputValue.trim() && attachments.length === 0) || loadingState !== LoadingState.IDLE}
              className={`p-2 rounded-lg transition-all ${inputValue.trim() || attachments.length > 0 ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' : 'bg-transparent text-gray-300 cursor-default'}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;