import { useState } from 'react';
import { Book as BookIcon, Users, MapPin, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Book } from '../../services/bookService';
import { BookDetailsModal } from '../modals/BookDetailsModal';

interface BookCardProps {
    book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
    const [showDetails, setShowDetails] = useState(false);

    // Prefer formatting Authors as "FirstName LastName"
    const authorsText = book.authors?.length 
        ? book.authors.map(a => `${a.author.firstName} ${a.author.lastName}`).join(', ')
        : 'Autor desconocido';

    const locationText = book.copies && book.copies.length > 0 
        ? book.copies[0].location 
        : 'Sin ubicación';

    return (
        <>
            <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full group relative transition-all duration-500"
            >
                {/* Image / Cover Area */}
                <div className="h-52 bg-slate-800/80 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-purple-500/10 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
                    <BookIcon size={70} className="text-indigo-300 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-110 transition-transform duration-500 relative z-10" />
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1 relative z-10">
                    <div className="flex-1">
                        <h3 className="text-xl font-extrabold text-slate-100 mb-2 line-clamp-2 leading-tight tracking-tight group-hover:text-indigo-300 transition-colors">
                            {book.title}
                        </h3>

                        <div className="flex items-start gap-2 text-sm text-slate-400 mb-4">
                            <Users size={16} className="shrink-0 mt-0.5 text-indigo-400/70" />
                            <p className="line-clamp-2 font-medium">
                                {authorsText}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {book.categories?.slice(0, 3).map(cat => (
                                <span key={cat.category.categoryId} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-lg text-xs font-bold tracking-wide">
                                    {cat.category.title}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500 mb-2">
                            <div className="flex items-center gap-2">
                                <Hash size={14} className="text-slate-600" />
                                <span>ISBN: {book.isbn}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-slate-600" />
                                <span>{locationText}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-700/50 mt-4">
                        <div className="text-xs text-slate-500 font-bold">
                            {book.publicationYear}
                        </div>
                        <button
                            onClick={() => setShowDetails(true)}
                            className="text-indigo-400 text-sm font-bold hover:text-purple-400 transition-colors flex items-center gap-1"
                        >
                            Ver Características
                        </button>
                    </div>
                </div>
            </motion.div>

            <BookDetailsModal
                book={book}
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
            />
        </>
    );
};
