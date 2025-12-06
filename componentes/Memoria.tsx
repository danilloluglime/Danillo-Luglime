
import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { searchUserMemory } from '../services/geminiService';
import { Search, Brain, Plus, Save, Clock, Image as ImageIcon, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Memoria = () => {
  const { memories, addMemory, ...allData } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ answer: string, imageKeyword: string } | null>(null);

  // State for adding new memory
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryTags, setNewMemoryTags] = useState('');

  const handleSearch = async () => {
      if (!query.trim()) return;
      setIsSearching(true);
      setResult(null);

      const searchResult = await searchUserMemory(query, { memories, ...allData } as any);
      setResult(searchResult);
      setIsSearching(false);
  };

  const handleAddMemory = () => {
      if (!newMemoryContent.trim()) return;
      
      const tags = newMemoryTags.split(',').map(t => t.trim()).filter(t => t);
      // Ensure unique image by appending timestamp to seed
      const imageSeed = (tags[0] || 'memory') + Date.now();
      
      addMemory({
          content: newMemoryContent,
          tags: tags,
          date: new Date().toISOString(),
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/600/400`
      });

      setNewMemoryContent('');
      setNewMemoryTags('');
      setShowAddModal(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-screen flex flex-col">
        <div className="text-center mb-8 md:mb-10 mt-4 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
                <Brain className="text-indigo-500" size={32} /> Memória Pessoal
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Seu "Google" individual. Consulte seu passado, fatos e ideias.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto w-full relative mb-10 px-2">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="O que eu fiz semana passada?"
                    className="w-full pl-12 pr-20 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 text-base md:text-lg shadow-lg focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all"
                />
                <button 
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    className="absolute inset-y-2 right-2 px-4 md:px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium text-sm">
                    {isSearching ? <Loader2 className="animate-spin" /> : 'Buscar'}
                </button>
            </div>
            
            <div className="mt-4 flex justify-center">
                <button onClick={() => setShowAddModal(true)} className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full transition-colors">
                    <Plus size={16} /> Salvar nova lembrança
                </button>
            </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
            {result && (
                <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-50 dark:border-indigo-900/20 mb-12 animate-in slide-in-from-bottom-4 mx-2">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Search size={20} className="text-indigo-500" /> Resultado:
                            </h3>
                            <div className="prose dark:prose-invert text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                <ReactMarkdown>{result.answer}</ReactMarkdown>
                            </div>
                        </div>
                        {result.imageKeyword && (
                            <div className="w-full md:w-1/3 shrink-0">
                                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg relative group">
                                    <img 
                                        src={`https://picsum.photos/seed/${encodeURIComponent(result.imageKeyword)}/600/400`} 
                                        alt="Visual Memory" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/600/400?grayscale')}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <p className="text-white text-xs font-medium flex items-center gap-2">
                                            <ImageIcon size={14} /> Memória Visual Gerada
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Memories Grid */}
            <div className="px-2">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2">
                    <Clock size={18} /> Lembranças Recentes
                </h3>
                <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {memories.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Brain size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Sua memória está vazia. Comece a salvar fatos importantes!</p>
                        </div>
                    )}
                    {memories.map(mem => (
                        <div key={mem.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="aspect-[4/3] w-full mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                                <img 
                                    src={mem.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(mem.tags[0] || 'memory')}/400/300`}
                                    alt="Memory"
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500"
                                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?grayscale')}
                                />
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-3 text-sm flex-1">
                                "{mem.content}"
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                                {mem.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md uppercase font-bold tracking-wide">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-3 text-right border-t border-gray-100 dark:border-gray-700 pt-2">
                                {new Date(mem.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Add Memory Modal */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 relative">
                    <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                        <X size={20} />
                    </button>
                    
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                        <Save className="text-indigo-500" /> Guardar Lembrança
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">O que você quer lembrar?</label>
                            <textarea 
                                value={newMemoryContent}
                                onChange={(e) => setNewMemoryContent(e.target.value)}
                                placeholder="Ex: A senha do wifi da casa de praia é 'Sol123'..."
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl h-32 resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags (para gerar a imagem)</label>
                            <input 
                                value={newMemoryTags}
                                onChange={(e) => setNewMemoryTags(e.target.value)}
                                placeholder="Ex: wifi, praia, segurança"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={() => setShowAddModal(false)} className="px-5 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition font-medium">Cancelar</button>
                        <button onClick={handleAddMemory} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 font-bold">
                            Salvar na Memória
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Memoria;
