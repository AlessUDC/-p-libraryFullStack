import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookCopy, User as UserIcon, Calendar, Loader2, CheckCircle, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import type { Student } from '../../services/studentService';
import { bookService } from '../../services/bookService';
import type { Book } from '../../services/bookService';
import { loanService } from '../../services/loanService';

interface NewLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'student' | 'book' | 'confirm'>('student');
    const [studentDocType, setStudentDocType] = useState('DNI');
    const [studentDocNumber, setStudentDocNumber] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null);
    const [loanDays, setLoanDays] = useState(3);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchBooks = async () => {
                try {
                    const data = await bookService.getAll();
                    // Filter books with available copies
                    const availableBooks = data.filter(book =>
                        book.copies?.some(e => e.status === 'AVAILABLE')
                    );
                    setBooks(availableBooks);
                } catch (err) {
                    console.error('Error fetching books:', err);
                }
            };
            fetchBooks();
        }
    }, [isOpen]);

    const handleFindStudent = async () => {
        if (!studentDocNumber) return;
        setLoading(true);
        setError('');
        try {
            const student = await studentService.findByDocument(studentDocType, studentDocNumber);
            if (!student) {
                setError(`No se encontró ningún estudiante con ${studentDocType} ${studentDocNumber}.`);
                setLoading(false);
                return;
            }
            if (!student.user.userData.isActive) {
                setError('El estudiante está inactivo o bloqueado actualmente.');
                setLoading(false);
                return;
            }
            setSelectedStudent(student);
            setStep('book');
        } catch (err) {
            setError('Error al buscar estudiante. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBook = () => {
        const book = books.find(b => b.bookId === selectedBookId);
        if (book) {
            setSelectedBook(book);
            const availableCopy = book.copies?.find(e => e.status === 'AVAILABLE');
            if (availableCopy) {
                setSelectedCopyId(availableCopy.copyId);
            }
            setStep('confirm');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (!selectedStudent || !selectedCopyId || !user) {
                throw new Error('Datos incompletos para procesar la transacción');
            }

            // Calculate expected return date
            const expectedReturnDate = new Date();
            expectedReturnDate.setDate(expectedReturnDate.getDate() + loanDays);

            const loanData = {
                borrowerUserId: selectedStudent.userId,
                copyId: selectedCopyId,
                librarianUserId: user.id,
                expectedReturnDate: expectedReturnDate.toISOString(),
                lendingPolicyId: 'default-policy' // We'll use a default or fetch later
            };

            await loanService.create(loanData);

            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al autorizar el préstamo interestelar.');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('student');
        setStudentDocNumber('');
        setSelectedStudent(null);
        setSelectedBookId('');
        setSelectedBook(null);
        setSelectedCopyId(null);
        setLoanDays(3);
        setError('');
        setSuccess(false);
        onClose();
    };

    const loanEndDate = new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50"
                    />

                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="glass-panel max-w-2xl w-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto border-white/10"
                        >
                            {/* Header */}
                            <div className="bg-linear-to-br from-emerald-600/20 to-emerald-400/10 p-10 relative overflow-hidden shrink-0 border-b border-white/5">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                                <button
                                    onClick={handleClose}
                                    className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white z-20"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="w-16 h-16 bg-emerald-600/30 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-400/30 shadow-xl shadow-emerald-500/10">
                                        <BookCopy size={32} className="text-emerald-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Autorizar Préstamo</h2>
                                        <p className="text-slate-400 text-sm font-medium mt-1">
                                            {step === 'student' && 'Fase 1: Encontrar Socio'}
                                            {step === 'book' && 'Fase 2: Asignar Obra'}
                                            {step === 'confirm' && 'Fase 3: Verificación Técnica'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white/1">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-start gap-4">
                                        <AlertCircle className="text-red-400 w-6 h-6 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-200 font-bold">{error}</p>
                                    </motion.div>
                                )}

                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                            <CheckCircle className="text-emerald-400 w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-3">¡Transacción Registrada!</h3>
                                        <p className="text-slate-400 font-medium tracking-wide">La obra ha sido asignada correctamente al socio.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Step 1: Student */}
                                        {step === 'student' && (
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">Tipo Documento</label>
                                                        <select
                                                            value={studentDocType}
                                                            onChange={(e) => setStudentDocType(e.target.value)}
                                                            className="w-full glass-input px-4 py-4 text-slate-300 bg-slate-900 border-white/10"
                                                        >
                                                            <option value="DNI" className="bg-slate-900">DNI (Nacional)</option>
                                                            <option value="PASAPORTE" className="bg-slate-900">PASAPORTE</option>
                                                            <option value="CARNET_EXTRANJERIA" className="bg-slate-900">CARNET EXT.</option>
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">Identificación del Estudiante</label>
                                                        <div className="flex gap-4">
                                                            <div className="relative flex-1 group">
                                                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                                                <input
                                                                    type="text"
                                                                    value={studentDocNumber}
                                                                    onChange={(e) => setStudentDocNumber(e.target.value)}
                                                                    placeholder="Ej: 60748729"
                                                                    className="w-full glass-input pl-14 pr-4 py-4"
                                                                    onKeyPress={(e) => e.key === 'Enter' && handleFindStudent()}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={handleFindStudent}
                                                                disabled={loading || !studentDocNumber}
                                                                className="px-8 bg-emerald-600/20 text-emerald-400 rounded-2xl font-black uppercase tracking-widest border border-emerald-400/20 hover:bg-emerald-600/30 disabled:opacity-30 transition-all flex items-center justify-center gap-2 group"
                                                            >
                                                                {loading ? <Loader2 className="animate-spin" size={20} /> : <UserIcon size={20} className="group-hover:scale-110 transition-transform" />}
                                                                Ubicar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-emerald-500/5 rounded-4xl border border-emerald-400/10 flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 shadow-xl">
                                                        <CheckCircle size={22} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-300 font-bold leading-relaxed">
                                                            El sistema verificará automáticamente el estado de las penalizaciones y si el socio tiene una cuenta activa en el nodo bibliotecario.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Book Selection */}
                                        {step === 'book' && selectedStudent && (
                                            <div className="space-y-8">
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-600/10 rounded-4xl p-8 border border-indigo-400/20 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl -mr-16 -mt-16" />
                                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">SOCIO IDENTIFICADO</p>
                                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                                        {selectedStudent.user.userData.firstName} {selectedStudent.user.userData.paternalLastName} {selectedStudent.user.userData.maternalLastName}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-4">
                                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-tighter border border-white/5">
                                                            {selectedStudent.school.title}
                                                        </span>
                                                        <span className="px-3 py-1 bg-indigo-500/10 rounded-lg text-[10px] font-black text-indigo-300 uppercase tracking-tighter border border-indigo-500/10">
                                                            {selectedStudent.cycle} CICLO
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">Seleccionar Obra Disponible</label>
                                                    <select
                                                        value={selectedBookId}
                                                        onChange={(e) => setSelectedBookId(e.target.value)}
                                                        className="w-full glass-input px-4 py-4 text-slate-300 bg-slate-900 border-white/10"
                                                    >
                                                        <option value="" className="bg-slate-900">-- BUSCAR EN EL CATÁLOGO --</option>
                                                        {books.map(book => (
                                                            <option key={book.bookId} value={book.bookId} className="bg-slate-900">
                                                                {book.title} ({book.copies?.filter(e => e.status === 'AVAILABLE').length} disponibles)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <button
                                                    onClick={handleSelectBook}
                                                    disabled={!selectedBookId}
                                                    className="w-full py-5 glass-button text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30"
                                                >
                                                    Proceder a Verificación <ArrowRight className="inline ml-2" size={20} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Step 3: Confirmation */}
                                        {step === 'confirm' && selectedStudent && selectedBook && (
                                            <div className="space-y-8">
                                                <div className="glass-panel rounded-[2.5rem] p-8 space-y-8 border-indigo-500/10">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">Socio / Borrower</p>
                                                            <p className="text-xl font-black text-white tracking-tight leading-tight">
                                                                {selectedStudent.user.userData.firstName} {selectedStudent.user.userData.paternalLastName} {selectedStudent.user.userData.maternalLastName}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">CODE: {selectedStudent.user.code}</p>
                                                        </div>
                                                        <div className="flex-1 text-right">
                                                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">Obra / Reference</p>
                                                            <p className="text-xl font-black text-white tracking-tight leading-tight">{selectedBook.title}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold mt-1 italic line-clamp-1">
                                                                BY: {selectedBook.authors?.map(a => a.author.firstName + ' ' + a.author.lastName).join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 border-t border-white/5 space-y-6">
                                                        <div className="flex flex-col md:flex-row gap-6 md:items-end">
                                                            <div className="flex-1">
                                                                <label className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                    <Calendar size={14} /> Ciclo de Vida del Préstamo (Días)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={loanDays}
                                                                    onChange={(e) => setLoanDays(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                                                                    min="1"
                                                                    max="15"
                                                                    className="w-full glass-input px-5 py-4 text-xl font-black text-indigo-300"
                                                                />
                                                            </div>
                                                            <div className="flex-1 bg-white/2 p-6 rounded-2xl border border-white/5">
                                                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3">Cronograma de Retorno</p>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="text-center">
                                                                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Hoy</p>
                                                                        <p className="text-xs font-black text-slate-200">{new Date().toLocaleDateString()}</p>
                                                                    </div>
                                                                    <div className="h-px w-8 bg-indigo-500/20" />
                                                                    <div className="text-center">
                                                                        <p className="text-[9px] text-indigo-400 font-black uppercase mb-1">Fecha Límite</p>
                                                                        <p className="text-sm font-black text-indigo-300 shadow-indigo-500/10 drop-shadow-md">{loanEndDate.toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={loading}
                                                    className="w-full py-6 glass-button text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={24} />
                                                            Autorizando Transacción...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={24} />
                                                            Sellar y Archivar Préstamo
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
