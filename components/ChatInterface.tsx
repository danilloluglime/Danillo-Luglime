import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendMessageToAI } from '../services/geminiService';
import { Send, Mic, StopCircle, Plus, FileText, Image as ImageIcon, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

const ChatInterface = () => {
  const { chatHistory, addChatMessage, tasks, goals, addTask, addGoal, user } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ type: 'image' | 'audio' | 'pdf', mimeType: string, data: string } | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !attachment) || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: inputText,
      timestamp: Date.now(),
      attachment: attachment ? { ...attachment } : undefined
    };

    addChatMessage(userMsg);
    setInputText('');
    setAttachment(undefined);
    setIsLoading(true);

    // Call AI Service
    const aiResponse = await sendMessageToAI(
      userMsg.text || (userMsg.attachment ? "Process this attachment" : ""),
      chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      { tasks, goals },
      userMsg.attachment
    );

    // Handle Tool Calls (Task/Goal Creation)
    if (aiResponse.toolCalls) {
      aiResponse.toolCalls.forEach((call: any) => {
        const args = call.args;
        if (call.name === 'createTask') {
          addTask({
            title: args.title,
            category: args.category || 'Geral',
            priority: args.priority || 'Média',
            dueDate: args.dueDate || new Date().toISOString().split('T')[0]
          });
        } else if (call.name === 'createGoal') {
            addGoal({
                title: args.title,
                description: args.description || '',
                deadline: args.deadline || ''
            });
        }
      });
      // Append a system confirmation message if tools were used but no text returned (optional, usually model returns text too)
    }

    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model' as const,
      text: aiResponse.text,
      timestamp: Date.now()
    };
    addChatMessage(aiMsg);
    setIsLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' }); // Gemini supports mp3/wav/etc
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Strip prefix for Gemini API usage later if needed, but for state we keep it
           const base64Content = base64data.split(',')[1];
           
           setAttachment({
               type: 'audio',
               mimeType: 'audio/mp3',
               data: base64Content
           });
           // Automatically send after recording stop? Or let user confirm. 
           // Let's let user confirm by adding text or just hitting send.
           // For better UX, let's put a placeholder text
           setInputText("(Áudio gravado. Clique em enviar)");
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Erro ao acessar microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Relatório UltraIA - ${user.name}`, 10, 20);
    doc.setFontSize(12);
    
    let y = 30;
    doc.text("Resumo da Conversa:", 10, y);
    y += 10;

    chatHistory.slice(-5).forEach(msg => {
        const line = `${msg.role === 'user' ? 'Você' : 'UltraIA'}: ${msg.text.substring(0, 80)}...`;
        doc.text(line, 10, y);
        y += 10;
    });

    y += 10;
    doc.text("Tarefas Pendentes:", 10, y);
    y += 10;
    tasks.filter(t => !t.completed).forEach(t => {
        doc.text(`- [${t.priority}] ${t.title}`, 10, y);
        y += 7;
    });

    doc.save('relatorio-ultraia.pdf');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          // Determine type roughly
          const type = file.type.startsWith('image') ? 'image' : 'pdf'; // simplified
          if(type === 'image') {
              setAttachment({ type: 'image', mimeType: file.type, data: base64String });
          }
      };
      reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Chat Inteligente
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={generatePDF}
                className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors dark:text-gray-300">
                <FileText size={14} /> PDF
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8" />
                </div>
                <p>Comece uma conversa com seu Coach.</p>
            </div>
        )}
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
              }`}
            >
              {msg.attachment && (
                  <div className="mb-2 p-2 bg-black/10 rounded text-xs flex items-center gap-2">
                      {msg.attachment.type === 'audio' ? <Mic size={14}/> : <ImageIcon size={14}/>}
                      Anexo ({msg.attachment.type})
                  </div>
              )}
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <span className="text-[10px] opacity-70 mt-2 block text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Loader2 className="animate-spin text-primary-600" size={18} />
                    <span className="text-sm text-gray-500">UltraIA digitando...</span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-2xl border border-transparent focus-within:border-primary-500 transition-colors">
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800">
                <Plus size={20} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
            />

            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                placeholder="Digite uma mensagem, tarefa ou dúvida..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400"
                rows={1}
            />

            {attachment && (
                <div className="absolute bottom-14 left-2 bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full text-xs text-primary-700 flex items-center gap-2">
                    <span>Anexo pronto</span>
                    <button onClick={() => setAttachment(undefined)} className="hover:text-red-500">x</button>
                </div>
            )}

            {isRecording ? (
                 <button 
                 onClick={stopRecording}
                 className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors animate-pulse shadow-lg shadow-red-500/30">
                 <StopCircle size={20} />
             </button>
            ) : (
                <button 
                    onClick={startRecording}
                    className="p-3 text-gray-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800">
                    <Mic size={20} />
                </button>
            )}

            <button 
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && !attachment) || isLoading}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20">
                <Send size={20} />
            </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
            A IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;