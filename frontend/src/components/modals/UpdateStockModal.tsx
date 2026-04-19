import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, History, TrendingUp, TrendingDown, RefreshCcw, Layers, Barcode, MapPin } from 'lucide-react';
import { bookService } from '../../services/bookService';
import type { Book } from '../../services/bookService';
import { formatDateTime } from '../../utils/dateUtils';

interface UpdateStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book;
    onSuccess: () => void;
}

interface StockHistoryEntry {
    historyId: string;
    date: string;
    movementType: 'INCREMENT' | 'DECREMENT';
    previousQuantity: number;
    newQuantity: number;
    user: string;
}

export const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ isOpen, onClose, book, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'manage' | 'history' | 'copies'>('manage');
    const [quantity, setQuantity] = useState<number>(0);
    const [location, setLocation] = useState('Biblioteca Principal');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<StockHistoryEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Calculate stats based on new English schema
    const totalCopies = book.copies?.length || 0;
    const available = book.copies?.filter(e => e.status === 'AVAILABLE').length || 0;
    const occupied = book.copies?.filter(e => e.status !== 'AVAILABLE').length || 0;

    useEffect(() => {
        if (isOpen) {
            setQuantity(totalCopies);
            fetchHistory();
        }
    }, [isOpen, book]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            // Mapping to the new record service
            const data = await bookService.getStockHistory(book.bookId);
            setHistory(data);
        } catch (error) {
            console.error('Error fetching stock history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await bookService.updateStock(book.bookId, quantity, location);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating stock:', error);
            alert('Error al sincronizar el stock: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

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
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="glass-panel max-w-2xl w-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 border-b border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                                <div className="relative z-10 flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-emerald-600/20 rounded-2xl border border-emerald-400/20 shadow-xl shadow-emerald-500/10">
                                            <Layers size={28} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">Gestión de Inventario</h2>
                                            <p className="text-slate-400 text-sm font-medium mt-0.5 line-clamp-1">{book.title}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white">
                                        <X size={22} />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex bg-white/2 border-b border-white/5">
                                <button
                                    onClick={() => setActiveTab('manage')}
                                    className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'manage' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    AUDITORÍA DE STOCK
                                    {activeTab === 'manage' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    LOG DE MOVIMIENTOS
                                    {activeTab === 'history' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('copies')}
                                    className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'copies' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    EJEMPLARES
                                    {activeTab === 'copies' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                                </button>
                            </div>

                            {/* Main Scrollable Content */}
                            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white/1">
                                {activeTab === 'manage' ? (
                                    <div className="space-y-10">
                                        {/* Status Indicators */}
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="glass-panel bg-white/3 p-5 rounded-2xl border-white/5 text-center group transition-all hover:bg-white/5">
                                                <span className="block text-3xl font-black text-white group-hover:scale-110 transition-transform">{totalCopies}</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 block">Total</span>
                                            </div>
                                            <div className="glass-panel bg-emerald-500/5 p-5 rounded-2xl border-emerald-500/20 text-center group transition-all hover:bg-emerald-500/10">
                                                <span className="block text-3xl font-black text-emerald-400 group-hover:scale-110 transition-transform">{available}</span>
                                                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mt-1 block">Libres</span>
                                            </div>
                                            <div className="glass-panel bg-indigo-500/5 p-5 rounded-2xl border-indigo-500/20 text-center group transition-all hover:bg-indigo-500/10">
                                                <span className="block text-3xl font-black text-indigo-400 group-hover:scale-110 transition-transform">{occupied}</span>
                                                <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest mt-1 block">En Uso</span>
                                            </div>
                                        </div>

                                        {/* Interaction Area */}
                                        <div className="glass-panel p-10 rounded-[2.5rem] border-white/5 bg-white/3 space-y-8">
                                            <div>
                                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Ajuste de Cantidad Maestra</label>
                                                <div className="flex items-center gap-8 justify-center">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                                        className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-2xl text-white transition-all active:scale-90"
                                                    >
                                                        -
                                                    </button>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={quantity}
                                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                                            className="w-40 text-center text-5xl font-black text-white bg-transparent border-none outline-none focus:ring-0"
                                                        />
                                                        <div className="h-1 w-20 bg-emerald-500/30 mx-auto mt-2 rounded-full" />
                                                    </div>
                                                    <button
                                                        onClick={() => setQuantity(quantity + 1)}
                                                        className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-2xl text-white transition-all active:scale-90"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {quantity < totalCopies && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-5 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-start gap-4">
                                                        <TrendingDown size={20} className="text-red-400 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-red-200 font-bold leading-relaxed">
                                                            ATENCIÓN: Se eliminarán irrevocablemente {totalCopies - quantity} ejemplares disponibles del archivo.
                                                        </p>
                                                    </motion.div>
                                                )}
                                                {quantity > totalCopies && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start gap-4">
                                                        <TrendingUp size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-emerald-200 font-bold leading-relaxed">
                                                            SISTEMA: Se generarán {quantity - totalCopies} nuevos identificadores para las obras añadidas.
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="pt-4 space-y-3">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Geolocalización del Stock</label>
                                                <div className="relative group">
                                                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        className="w-full glass-input pl-12 pr-4 py-4"
                                                        placeholder="Célula, Pasillo o Estante"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeTab === 'copies' ? (
                                    <div className="space-y-4">
                                        {book.copies && book.copies.length > 0 ? (
                                            book.copies.map((copy) => (
                                                <div key={copy.copyId} className="glass-panel bg-white/2 p-6 rounded-3xl border-white/5 flex items-center justify-between group hover:bg-white/4 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl ${
                                                            copy.status === 'AVAILABLE' 
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                                : copy.status === 'BORROWED' 
                                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            <Barcode size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-100 text-base font-mono tracking-wider">
                                                                {copy.barcode}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1 flex items-center gap-1">
                                                                <MapPin size={10} /> {copy.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                                                        copy.status === 'AVAILABLE' 
                                                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-400/20' 
                                                            : copy.status === 'BORROWED' 
                                                                ? 'bg-indigo-500/5 text-indigo-400 border-indigo-400/20' 
                                                                : 'bg-red-500/5 text-red-400 border-red-400/20'
                                                    }`}>
                                                        {copy.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-32 opacity-30">
                                                <Barcode size={60} className="text-slate-700 mb-6" />
                                                <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Sin ejemplares físicos</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {loadingHistory ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <RefreshCcw className="animate-spin w-12 h-12 text-indigo-500/50" />
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Leyendo Archivos...</p>
                                            </div>
                                        ) : history.length > 0 ? (
                                            <div className="space-y-4">
                                                {history.map((entry) => (
                                                    <div key={entry.historyId} className="glass-panel bg-white/2 p-6 rounded-3xl border-white/5 flex items-center justify-between group hover:bg-white/4 transition-all">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl ${
                                                                entry.movementType === 'INCREMENT' 
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                            }`}>
                                                                {entry.movementType === 'INCREMENT' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-100 text-base">
                                                                    {entry.previousQuantity} <span className="text-slate-600 mx-2">→</span> {entry.newQuantity} <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Obras</span>
                                                                </p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">
                                                                    {formatDateTime(entry.date)} • BY {entry.user || 'SYSTEM'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                                                            entry.movementType === 'INCREMENT' 
                                                                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-400/20' 
                                                                : 'bg-red-500/5 text-red-400 border-red-400/20'
                                                        }`}>
                                                            {entry.movementType === 'INCREMENT' ? 'EXPANSIÓN' : 'CONTRACCIÓN'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-32 opacity-30">
                                                <History size={60} className="text-slate-700 mb-6" />
                                                <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Sin registros de evolución</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sticky Interaction Bar */}
                            <AnimatePresence>
                                {activeTab === 'manage' && (
                                    <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="p-8 border-t border-white/5 bg-slate-900/40 backdrop-blur-3xl shrink-0">
                                        <button
                                            onClick={handleUpdate}
                                            disabled={loading || quantity < occupied}
                                            className="w-full py-5 glass-button text-white rounded-3xl font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3 group"
                                        >
                                            {loading ? <RefreshCcw className="animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
                                            Actualizar Matriz de Inventario
                                        </button>
                                        {quantity < occupied && (
                                            <p className="text-center text-[10px] text-red-400 font-black uppercase tracking-tighter mt-4 animate-pulse">
                                                BLOQUEADO: No puedes reducir el stock por debajo de la cantidad de obras en uso ({occupied})
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
