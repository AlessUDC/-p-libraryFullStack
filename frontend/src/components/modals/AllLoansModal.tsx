import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCopy, Search, Filter, X, CheckCircle } from 'lucide-react';
import { loanService } from '../../services/loanService';
import type { Loan } from '../../services/loanService';
import { formatDate } from '../../utils/dateUtils';

interface AllLoansModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AllLoansModal: React.FC<AllLoansModalProps> = ({ isOpen, onClose }) => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<Loan | null>(null);
    const [returnDate, setReturnDate] = useState('');

    const executeReturn = async (loan: Loan, dateStr: string) => {
        try {
            // If date selected is Today, use current full timestamp to avoid "return before loan" error (400)
            const today = new Date().toLocaleDateString('en-CA');
            let dateToSubmit: string;

            if (dateStr === today) {
                dateToSubmit = new Date().toISOString();
            } else {
                // For past dates, pin to midday UTC
                dateToSubmit = `${dateStr}T12:00:00.000Z`;
            }

            await loanService.update(loan.lendingId, {
                actualReturnDate: dateToSubmit,
                status: 'DEVUELTO'
            });
            const updatedLoans = await loanService.getAll();
            setLoans(updatedLoans);
            setSelectedLoanForReturn(null);
        } catch (error) {
            console.error('Error returning loan:', error);
            alert('Error al procesar la devolución. Verifique que la fecha no sea anterior al préstamo.');
        }
    };

    const confirmManualReturn = async (loan: Loan) => {
        const today = new Date().toLocaleDateString('en-CA');
        const limitDate = new Date(loan.expectedReturnDate).toLocaleDateString('en-CA');
        const startDate = new Date(loan.lendingDate).toLocaleDateString('en-CA');

        // Validation: Cannot return before it was borrowed
        if (returnDate < startDate) {
            alert(`La fecha de devolución no puede ser anterior a la fecha de préstamo (${formatDate(loan.lendingDate)}).`);
            return;
        }

        // Validation: For ACTIVE loans, cannot exceed deadline
        if (loan.status === 'ACTIVE' && returnDate > limitDate) {
            alert(`Para préstamos ACTIVOS, la fecha de devolución no puede superar la fecha límite (${formatDate(loan.expectedReturnDate)}).`);
            return;
        }

        // Validation: Future dates
        if (returnDate > today) {
            alert('No se puede registrar una devolución en una fecha futura.');
            return;
        }
        await executeReturn(loan, returnDate);
    };

    const initiateReturn = (loan: Loan) => {
        setSelectedLoanForReturn(loan);
        setReturnDate(new Date().toLocaleDateString('en-CA'));
    };

    const handleReturnClick = (loan: Loan) => {
        const today = new Date().toLocaleDateString('en-CA');
        const limitDate = new Date(loan.expectedReturnDate).toLocaleDateString('en-CA');

        // automatic return only if Active and within limit
        if (loan.status === 'ACTIVE' && today <= limitDate) {
            if (window.confirm('El préstamo está a tiempo. ¿Desea registrar la devolución con fecha de hoy?')) {
                executeReturn(loan, today);
            }
        } else {
            // Overdue or Lost or Active-but-late (if possible logic-wise) -> Manual Input
            initiateReturn(loan);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const fetchLoans = async () => {
                try {
                    const data = await loanService.getAll();
                    setLoans(data);
                } catch (error) {
                    console.error('Error fetching loans:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLoans();
        }
    }, [isOpen]);

    const filteredLoans = loans.filter(loan => {
        const matchesSearch =
            loan.borrower.userData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.borrower.userData.paternalLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.copy.book.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="min-h-40 md:min-h-30 bg-gradient-to-br from-violet-600 to-violet-700 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md border border-white/20">
                                        <BookCopy size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl lg:text-2xl font-black mb-1">Todos los Préstamos</h2>
                                        <p className="text-violet-100 text-sm font-medium opacity-90">Gestiona y visualiza todos los préstamos registrados</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por estudiante o libro..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter size={20} className="text-slate-400" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        >
                                            <option value="all">Todos los Estados</option>
                                            <option value="ACTIVE">Activos</option>
                                            <option value="DEVUELTO">Devueltos</option>
                                            <option value="LOST">Perdidos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                                    </div>
                                ) : filteredLoans.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">ID</th>
                                                    <th className="px-6 py-4 text-left">Estudiante</th>
                                                    <th className="px-6 py-4 text-left">Libro</th>
                                                    <th className="px-6 py-4 text-left">Fecha Préstamo</th>
                                                    <th className="px-6 py-4 text-left">Fecha Límite</th>
                                                    <th className="px-6 py-4 text-left">Estado</th>
                                                    <th className="px-6 py-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredLoans.map((loan) => (
                                                    <tr key={loan.lendingId} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-slate-500">#{loan.lendingId}</td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-bold text-slate-900">{loan.borrower.userData.firstName} {loan.borrower.userData.paternalLastName}</p>
                                                            <p className="text-xs text-slate-500">{loan.borrower.userData.documentNumber}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-900 italic">"{loan.copy.book.title}"</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {new Date(loan.lendingDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            <div>
                                                                <span className="block">{formatDate(loan.expectedReturnDate)}</span>
                                                                {loan.actualReturnDate && (
                                                                    <span className="text-xs text-emerald-600 font-bold block">
                                                                        Devuelto: {formatDate(loan.actualReturnDate)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${loan.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' :
                                                                loan.status === 'LOST' ? 'bg-red-50 text-red-600' :
                                                                    'bg-emerald-50 text-emerald-600'
                                                                }`}>
                                                                {loan.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {loan.status !== 'DEVUELTO' && (
                                                                selectedLoanForReturn?.lendingId === loan.lendingId ? (
                                                                    <div className="flex items-center justify-end gap-2 bg-slate-100 p-2 rounded-xl">
                                                                        <input
                                                                            type="date"
                                                                            max={
                                                                                loan.status === 'ACTIVE'
                                                                                    ? [new Date().toLocaleDateString('en-CA'), new Date(loan.expectedReturnDate).toLocaleDateString('en-CA')].sort()[0]
                                                                                    : new Date().toLocaleDateString('en-CA')
                                                                            }
                                                                            value={returnDate}
                                                                            onChange={(e) => setReturnDate(e.target.value)}
                                                                            className="px-2 py-1 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 outline-none"
                                                                        />
                                                                        <button
                                                                            onClick={() => confirmManualReturn(loan)}
                                                                            className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                                                            title="Confirmar"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setSelectedLoanForReturn(null)}
                                                                            className="p-1 bg-slate-400 text-white rounded-lg hover:bg-slate-500"
                                                                            title="Cancelar"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleReturnClick(loan)}
                                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md ${loan.status === 'LOST'
                                                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                            }`}
                                                                    >
                                                                        {loan.status === 'LOST' ? 'Recuperar' : 'Devolver'}
                                                                    </button>
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-slate-400">No se encontraron préstamos</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
