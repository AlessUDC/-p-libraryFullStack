import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book as BookIcon, Users, Building2, MapPin, Hash, Calendar } from 'lucide-react';
import type { Book } from '../../services/bookService';

interface BookDetailsModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, isOpen, onClose }) => {
    if (!book) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="glass-panel max-w-2xl w-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10"
                        >
                            {/* Header Section */}
                            <div className="relative p-10 bg-linear-to-br from-indigo-900/50 to-purple-900/50 overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                                
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white z-20 group"
                                >
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>

                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-indigo-600/30 rounded-4xl flex items-center justify-center mb-6 border border-indigo-400/30 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                                        <BookIcon size={40} className="text-indigo-300" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight uppercase">
                                        {book.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {book.categories?.map(cat => (
                                            <span key={cat.category.categoryId} className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-200">
                                                {cat.category.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Details */}
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                                <Users className="text-indigo-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Autores</p>
                                                <div className="flex flex-col gap-1">
                                                    {book.authors?.map(a => (
                                                        <span key={a.author.authorId} className="text-sm font-bold text-slate-200">
                                                            {a.author.firstName} {a.author.lastName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                                <Building2 className="text-indigo-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Editorial</p>
                                                <p className="text-sm font-bold text-slate-200">{book.publisher?.title}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                                <Hash className="text-indigo-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">ISBN Identificador</p>
                                                <p className="text-sm font-bold text-slate-200 tracking-wider">#{book.isbn}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                                <Calendar className="text-indigo-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Año de Publicación</p>
                                                <p className="text-sm font-bold text-slate-200">{book.publicationYear}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Availability */}
                                    <div className="glass-panel rounded-3xl p-8 border-white/5 bg-white/2">
                                        <h3 className="text-sm font-black text-white mb-6 flex items-center gap-3 tracking-wide">
                                            <MapPin className="text-indigo-400" size={18} />
                                            DISPONIBILIDAD FÍSICA
                                        </h3>
                                        
                                        {book.copies && book.copies.length > 0 ? (
                                            <div className="space-y-5">
                                                {book.copies.map((copy, idx) => (
                                                    <div key={copy.copyId} className="flex items-center justify-between group/copy">
                                                        <div className="flex flex-col">
                                                            <p className="text-xs font-bold text-slate-200">EJEMPLAR #{idx + 1}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{copy.location}</p>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                                                            copy.status === 'AVAILABLE' 
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' 
                                                                : 'bg-red-500/10 text-red-400 border-red-400/20'
                                                        }`}>
                                                            {copy.status === 'AVAILABLE' ? 'DISPONIBLE' : 'OCUPADO'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <p className="text-xs text-slate-500 font-bold italic tracking-wide">SIN COPIAS EN CATÁLOGO</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
