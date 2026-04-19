import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book as BookIcon, Search, Edit2, Trash2, Library, Loader2, AlertCircle, Layers } from 'lucide-react';
import { bookService } from '../../services/bookService';
import { authService } from '../../services/authService';
import type { Book } from '../../services/bookService';
import { UpdateStockModal } from './UpdateStockModal';

interface ManageBooksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (book: Book) => void;
}

export const ManageBooksModal: React.FC<ManageBooksModalProps> = ({ isOpen, onClose, onEdit }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedBookForStock, setSelectedBookForStock] = useState<Book | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchBooks();
        }
    }, [isOpen]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await bookService.getAll();
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setIdToDelete(id);
        setPasswordInput('');
        setPasswordError(false);
    };

    const confirmDelete = async () => {
        if (!passwordInput) return;
        
        setVerifyingPassword(true);
        setPasswordError(false);
        try {
            await authService.verifyPassword(passwordInput);
            
            setDeletingId(idToDelete);
            await bookService.delete(idToDelete!);
            setBooks(prev => prev.filter(b => b.bookId !== idToDelete));
            setIdToDelete(null);
        } catch (error) {
            console.error('Auth/Delete error:', error);
            setPasswordError(true);
        } finally {
            setVerifyingPassword(false);
            setDeletingId(null);
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authors?.some(a => a.author.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || a.author.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50"
                    />

                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel max-w-5xl w-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto border-white/10"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-br from-amber-600/20 to-amber-400/10 p-10 relative overflow-hidden shrink-0 border-b border-white/5">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="w-16 h-16 bg-amber-600/30 rounded-2xl flex items-center justify-center shrink-0 border border-amber-400/30 shadow-[0_0_25px_rgba(217,119,6,0.2)]">
                                        <Library size={32} className="text-amber-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-white tracking-tight">Administrar Catálogo</h2>
                                        <p className="text-slate-400 text-sm font-medium mt-1">Modifica, audita o retira obras del inventario maestro</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white"
                                    >
                                        <X size={26} />
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="p-8 border-b border-white/5 bg-white/1">
                                <div className="relative group max-w-2xl mx-auto">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={22} />
                                    <input
                                        type="text"
                                        placeholder="Filtrar por título, autor o identificador..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-14 pr-4 py-4 glass-input text-lg rounded-2xl"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accediendo a los archivos...</p>
                                    </div>
                                ) : filteredBooks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredBooks.map((book) => (
                                            <div
                                                key={book.bookId}
                                                className="glass-panel bg-white/2 border-white/5 rounded-3xl p-6 hover:bg-white/4 transition-all flex items-start gap-5 group"
                                            >
                                                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
                                                    <BookIcon size={28} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-black text-slate-100 truncate mb-1 group-hover:text-amber-300 transition-colors" title={book.title}>{book.title}</h3>
                                                    <p className="text-xs text-slate-500 font-bold mb-3 truncate uppercase tracking-tight">
                                                        {book.authors?.map(a => `${a.author.firstName} ${a.author.lastName}`).join(', ')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {book.categories?.map(cat => (
                                                            <span key={cat.category.categoryId} className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                                                                {cat.category.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-500/60 uppercase tracking-widest">
                                                        <Layers size={12} />
                                                        {book.copies?.length || 0} EJEMPLARES EN STOCK
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-3 shrink-0">
                                                    <button
                                                        onClick={() => onEdit(book)}
                                                        className="p-2.5 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all border border-transparent hover:border-amber-400/20"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedBookForStock(book)}
                                                        className="p-2.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all border border-transparent hover:border-emerald-400/20"
                                                        title="Gestionar Stock"
                                                    >
                                                        <Layers size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(book.bookId)}
                                                        disabled={deletingId === book.bookId}
                                                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20"
                                                        title="Eliminar"
                                                    >
                                                        {deletingId === book.bookId ? (
                                                            <Loader2 size={20} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={20} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-32 flex flex-col items-center">
                                        <AlertCircle className="w-16 h-16 text-slate-800 mb-6 opacity-50" />
                                        <p className="text-slate-500 text-lg font-bold tracking-tight italic">
                                            No se encontraron registros activos en el catálogo maestro.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}

            {selectedBookForStock && (
                <UpdateStockModal
                    isOpen={!!selectedBookForStock}
                    onClose={() => setSelectedBookForStock(null)}
                    book={selectedBookForStock}
                    onSuccess={fetchBooks}
                />
            )}

            {/* Password Verification Prompt */}
            <AnimatePresence>
                {idToDelete && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                            onClick={() => setIdToDelete(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass-panel p-8 z-[160] border-red-500/20 shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                    <AlertCircle className="text-red-400" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">Acción Sensible</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                    Por seguridad, ingresa tu contraseña para confirmar la eliminación de la obra.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Contraseña del Bibliotecario"
                                    value={passwordInput}
                                    onChange={(e) => {
                                        setPasswordInput(e.target.value);
                                        setPasswordError(false);
                                    }}
                                    className={`w-full glass-input px-5 py-3 text-center ${passwordError ? 'border-red-500/50 ring-2 ring-red-500/20' : ''}`}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                                />
                                {passwordError && (
                                    <p className="text-[10px] text-red-400 font-black uppercase text-center tracking-widest animate-pulse">
                                        Contraseña incorrecta o error de red
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <button
                                        onClick={() => setIdToDelete(null)}
                                        className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 transition-all border border-white/5"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={verifyingPassword || !passwordInput}
                                        className="py-3 px-4 bg-red-600/80 hover:bg-red-500 border border-red-400/30 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                    >
                                        {verifyingPassword ? <Loader2 size={14} className="animate-spin" /> : 'Eliminar'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};
