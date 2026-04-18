import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Calendar, User, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import type { Loan } from '../../services/loanService';

import { formatDate } from '../../utils/dateUtils';

interface StudentLoanDetailsModalProps {
    loan: Loan | null;
    isOpen: boolean;
    onClose: () => void;
}

export const StudentLoanDetailsModal: React.FC<StudentLoanDetailsModalProps> = ({ loan, isOpen, onClose }) => {
    if (!loan) return null;

    const today = new Date().toLocaleDateString('en-CA');
    const limitDate = new Date(loan.expectedReturnDate).toLocaleDateString('en-CA');
    const isOverdue = !loan.actualReturnDate && today > limitDate;
    const isReturned = loan.status === 'DEVUELTO';
    const isLost = loan.status === 'LOST';

    const getStatusInfo = () => {
        if (isLost) {
            return {
                label: 'Perdido',
                color: 'bg-red-500',
                icon: AlertTriangle,
                description: 'Este libro ha sido reportado como perdido'
            };
        }
        if (isReturned) {
            return {
                label: 'Devuelto',
                color: 'bg-emerald-500',
                icon: CheckCircle,
                description: 'Libro devuelto exitosamente'
            };
        }
        if (isOverdue) {
            return {
                label: 'Vencido',
                color: 'bg-amber-500',
                icon: AlertTriangle,
                description: 'La fecha de devolución ya pasó'
            };
        }
        return {
            label: 'Activo',
            color: 'bg-blue-500',
            icon: Clock,
            description: 'Préstamo en curso'
        };
    };

    const status = getStatusInfo();
    const StatusIcon = status.icon;

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
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className={`${status.color} p-8 text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <BookOpen size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1">Detalles del Préstamo</h2>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon size={20} />
                                        <p className="text-white/90">Estado: {status.label} - {status.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    {/* Book Information */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shrink-0">
                                                <BookOpen className="text-white" size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Libro</p>
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">{loan.copy.book.title}</h3>
                                                <p className="text-sm text-slate-600">
                                                    Ubicación: <span className="font-bold">{loan.copy.location}</span>
                                                </p>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Ejemplar ID: #{loan.copyId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Search className="text-blue-600" size={18} />
                                                <p className="text-xs text-blue-600 font-bold uppercase">Fecha de Préstamo</p>
                                            </div>
                                            <p className="text-xl font-black text-blue-900">{formatDate(loan.lendingDate)}</p>
                                        </div>

                                        <div className={`${isOverdue && !isReturned ? 'bg-red-50 border-red-100' : 'bg-violet-50 border-violet-100'} border rounded-xl p-4`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className={isOverdue && !isReturned ? 'text-red-600' : 'text-violet-600'} size={18} />
                                                <p className={`text-xs font-bold uppercase ${isOverdue && !isReturned ? 'text-red-600' : 'text-violet-600'}`}>
                                                    Fecha Límite
                                                </p>
                                            </div>
                                            <p className={`text-xl font-black ${isOverdue && !isReturned ? 'text-red-900' : 'text-violet-900'}`}>
                                                {formatDate(loan.expectedReturnDate)}
                                            </p>
                                            {isOverdue && !isReturned && (
                                                <p className="text-xs text-red-600 mt-1 font-bold">¡Préstamo vencido!</p>
                                            )}
                                        </div>

                                        {loan.actualReturnDate && (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 md:col-span-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="text-emerald-600" size={18} />
                                                    <p className="text-xs text-emerald-600 font-bold uppercase">Fecha de Devolución</p>
                                                </div>
                                                <p className="text-2xl font-black text-emerald-900">{formatDate(loan.actualReturnDate)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Student Information */}
                                    <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/70 font-bold uppercase">Estudiante</p>
                                                <p className="font-black text-lg">
                                                    {loan.borrower.userData.firstName} {loan.borrower.userData.lastName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-white/70 text-xs">DNI</p>
                                                <p className="font-bold">{loan.borrower.userData.documentNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/70 text-xs">Código</p>
                                                <p className="font-bold">{loan.borrower.code}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warning if overdue */}
                                    {isOverdue && !isReturned && (
                                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <p className="font-bold text-amber-900 mb-1">Préstamo Vencido</p>
                                                    <p className="text-sm text-amber-700">
                                                        Por favor, devuelve el libro lo antes posible para evitar sanciones.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer info */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                                <p className="text-xs text-slate-400 font-medium">
                                    ID de Préstamo: #{loan.lendingId} • Ejemplar: #{loan.copyId}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
