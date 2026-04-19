import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBooks } from '../../hooks/useBooks';
import { BookCard } from '../../components/books/BookCard';
import { Search, Loader2, BookOpen, Clock, AlertTriangle, Filter, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TeacherHome = () => {
    const { getFullName } = useAuth();
    const { books, loading, searchBooks } = useBooks();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Dynamic Categories extraction
    const categories = useMemo(() => {
        const cats = new Set<string>();
        books.forEach(book => {
            book.categories?.forEach(c => cats.add(c.category.title));
        });
        return Array.from(cats);
    }, [books]);

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 book.isbn.includes(searchTerm) ||
                                 book.authors?.some(a => 
                                    a.author.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    a.author.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                                 );
            const matchesCategory = !selectedCategory || 
                                   book.categories?.some(c => c.category.title === selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [books, searchTerm, selectedCategory]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchBooks(searchTerm);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Hero Section */}
            <header className="relative py-16 px-8 rounded-[3rem] overflow-hidden glass-panel border-purple-500/10 mb-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20" />
                
                <div className="relative z-10 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <GraduationCap className="text-purple-400" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Portal Docente</span>
                        </div>
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-none tracking-tighter mb-4">
                            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">{getFullName()}</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium">
                            Gestione sus recursos académicos y explore la biblioteca global de Nexus.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSearch} className="mt-10 relative max-w-xl group">
                        <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Busca recursos, libros o autores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full glass-input pl-14 pr-32 py-5 text-lg rounded-2xl shadow-2xl shadow-purple-500/5 focus:ring-purple-500/50"
                        />
                        <button 
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-purple-600/80 hover:bg-purple-500/90 backdrop-blur-md border border-purple-400/30 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-purple-600/20"
                        >
                            Explorar
                        </button>
                    </form>
                </div>
            </header>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Sidebar Filters */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="glass-panel p-6 rounded-3xl border-white/5">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                            <Filter size={18} className="text-purple-400" />
                            Filtros de Catálogo
                        </h3>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                    !selectedCategory 
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                Todas las Categorías
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                        selectedCategory === cat
                                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-3xl p-8 rounded-4xl border border-white/5">
                        <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest mb-4">Estado Docente</p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-400/20">
                                    <BookOpen size={18} className="text-purple-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">0 Libros</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Recursos activos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-400/20">
                                    <Clock size={18} className="text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Excelente</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Estado de cuenta</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Grid */}
                <main className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Recursos Recomendados</h2>
                        <span className="text-sm font-bold text-slate-500">{filteredBooks.length} resultados encontrados</span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando archivo central...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {filteredBooks.map((book, idx) => (
                                    <motion.div
                                        key={book.bookId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <BookCard book={book} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredBooks.length === 0 && (
                                <div className="col-span-full py-20 glass-panel rounded-3xl flex flex-col items-center justify-center text-center">
                                    <AlertTriangle className="text-amber-500 mb-4" size={48} />
                                    <p className="text-slate-400 text-lg font-medium">No se encontraron resultados para su búsqueda.</p>
                                    <button 
                                        onClick={() => {setSearchTerm(''); setSelectedCategory(null);}}
                                        className="mt-6 text-purple-400 font-bold hover:underline"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
