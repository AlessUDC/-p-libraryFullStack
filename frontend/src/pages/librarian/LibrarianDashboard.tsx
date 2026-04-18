import { useEffect, useState } from 'react';

import { studentService, type Student } from '../../services/studentService';
import { loanService, type Loan } from '../../services/loanService';
import { bookService, type Book } from '../../services/bookService';
import { NewLoanModal } from '../../components/modals/NewLoanModal';
import { ReportsModal } from '../../components/modals/ReportsModal';
import { AllLoansModal } from '../../components/modals/AllLoansModal';
import { NewBookModal } from '../../components/modals/NewBookModal';
import { SanctionsModal } from '../../components/modals/SanctionsModal';
import { ManageBooksModal } from '../../components/modals/ManageBooksModal';
import { motion } from 'framer-motion';
import {
    Users,
    BookCopy,
    Calendar,
    AlertCircle,
    ArrowUpRight,
    Plus,
    Search,
    ChevronRight,
    Loader2,
    Library
} from 'lucide-react';

export const LibrarianDashboard = () => {

    const [students, setStudents] = useState<Student[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showNewLoanModal, setShowNewLoanModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showAllLoansModal, setShowAllLoansModal] = useState(false);
    const [showNewBookModal, setShowNewBookModal] = useState(false);
    const [showSanctionsModal, setShowSanctionsModal] = useState(false);
    const [showManageBooksModal, setShowManageBooksModal] = useState(false);
    const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsData, loansData, booksData] = await Promise.all([
                    studentService.getAll(),
                    loanService.getAll(),
                    bookService.getAll()
                ]);
                setStudents(studentsData);
                setLoans(loansData);
                setTotalBooks(booksData.length);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'IN_PROGRESS').length;
    const totalPenalties = students.reduce((acc, s) => {
        const active = s.user.penalties?.filter(p => p.status === 'ACTIVE').length || 0;
        return acc + active;
    }, 0);

    const stats = [
        { label: 'Estudiantes', value: students.length.toString(), icon: Users, color: 'from-blue-600/20 to-blue-400/20', textColor: 'text-blue-400', trend: 'Miembros activos' },
        { label: 'Préstamos', value: activeLoans.toString(), icon: BookCopy, color: 'from-emerald-600/20 to-emerald-400/20', textColor: 'text-emerald-400', trend: 'En curso' },
        { label: 'Libros', value: totalBooks.toString(), icon: Calendar, color: 'from-violet-600/20 to-violet-400/20', textColor: 'text-violet-400', trend: 'Títulos registrados' },
        { label: 'Sanciones', value: totalPenalties.toString(), icon: AlertCircle, color: 'from-amber-600/20 to-amber-400/20', textColor: 'text-amber-400', trend: 'Usuarios bloqueados' },
    ];

    const recentLoans = loans.slice(-5).reverse();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Sincronizando con el servidor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400 tracking-tight">Panel de Control</h1>
                    <p className="text-slate-400 font-medium mt-1">Gestión avanzada del ecosistema bibliotecario.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowReportsModal(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-2xl hover:bg-white/10 transition-all border-b-2 border-b-white/5 active:translate-y-0.5"
                    >
                        Reportes
                    </button>
                    <button
                        onClick={() => setShowNewLoanModal(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 glass-button text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
                    >
                        <Plus size={20} /> Nuevo Préstamo
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        key={stat.label}
                        className="glass-panel p-6 rounded-4xl hover:border-white/20 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8" />
                        
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3.5 rounded-2xl bg-linear-to-br ${stat.color} ${stat.textColor} border border-white/5 shadow-xl`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-emerald-400 flex items-center gap-1 text-[10px] font-black bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                                <ArrowUpRight size={14} /> LIVE
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold tracking-wide uppercase opacity-60">{stat.trend}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Loans List */}
                <div className="lg:col-span-2 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                        <h2 className="text-xl font-black text-white tracking-tight">Préstamos Recientes</h2>
                        <div className="relative w-48 sm:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar acción..."
                                className="w-full glass-input pl-10 pr-4 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/1 text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">
                                <tr>
                                    <th className="px-8 py-5">Socio / Estudiante</th>
                                    <th className="px-8 py-5">Obra / Libro</th>
                                    <th className="px-8 py-5 text-center">Fecha</th>
                                    <th className="px-8 py-5 text-center">Estado</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentLoans.map((loan) => (
                                    <tr key={loan.lendingId} className="hover:bg-white/3 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-200">{loan.borrower.userData.firstName} {loan.borrower.userData.lastName}</span>
                                                <span className="text-[10px] text-slate-500 font-bold">{loan.borrower.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-slate-300 font-medium italic text-sm">"{loan.copy.book.title}"</span>
                                        </td>
                                        <td className="px-8 py-6 text-center text-slate-400 text-sm font-semibold">
                                            {new Date(loan.lendingDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${
                                                loan.status === 'ACTIVE' || loan.status === 'IN_PROGRESS' 
                                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-400/20' 
                                                    : loan.status === 'LOST' 
                                                        ? 'bg-red-500/10 text-red-400 border-red-400/20' 
                                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
                                            }`}>
                                                {loan.status === 'IN_PROGRESS' ? 'ACTIVO' : loan.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-600 hover:text-indigo-400 transition-all hover:bg-white/5 rounded-lg">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {recentLoans.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-semibold italic">
                                            No hay registros registrados recientemente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={() => setShowAllLoansModal(true)}
                        className="p-5 text-center text-indigo-400 text-sm font-black hover:bg-white/5 transition-all border-t border-white/5 tracking-wider uppercase"
                    >
                        Auditar todos los préstamos
                    </button>
                </div>

                {/* Quick Actions / Categories */}
                <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between border-indigo-500/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-1 text-white">Acciones Rápidas</h2>
                        <p className="text-slate-400 text-sm font-medium mb-10">Control maestro de la biblioteca.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setShowNewBookModal(true)}
                                className="w-full flex items-center justify-between p-5 bg-white/3 hover:bg-white/6 border border-white/5 rounded-2xl transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-slate-200 group-hover:text-white transition-colors">Registrar Obra</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Nuevo en catálogo</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all border border-indigo-500/20">
                                    <Plus size={18} className="text-indigo-300" />
                                </div>
                            </button>
                            <button
                                onClick={() => setShowManageBooksModal(true)}
                                className="w-full flex items-center justify-between p-5 bg-white/3 hover:bg-white/6 border border-white/5 rounded-2xl transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-slate-200 group-hover:text-white transition-colors">Administrar Catálogo</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Modificar y Ajustar</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all border border-indigo-500/20">
                                    <Library size={18} className="text-indigo-300" />
                                </div>
                            </button>
                            <button
                                onClick={() => setShowSanctionsModal(true)}
                                className="w-full flex items-center justify-between p-5 bg-white/3 hover:bg-white/6 border border-white/5 rounded-2xl transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-slate-200 group-hover:text-white transition-colors">Gestionar Usuarios</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Penalizaciones / Bloqueos</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all border border-indigo-500/20">
                                    <AlertCircle size={18} className="text-indigo-300" />
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-slate-900/50 rounded-3xl border border-white/5 relative z-10 backdrop-blur-md">
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3">Infraestructura Nexus</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold text-slate-300">Base de datos optimizada en tiempo real</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <NewLoanModal
                isOpen={showNewLoanModal}
                onClose={() => setShowNewLoanModal(false)}
                onSuccess={() => window.location.reload()}
            />

            <ReportsModal
                isOpen={showReportsModal}
                onClose={() => setShowReportsModal(false)}
            />

            <AllLoansModal
                isOpen={showAllLoansModal}
                onClose={() => setShowAllLoansModal(false)}
            />

            <SanctionsModal
                isOpen={showSanctionsModal}
                onClose={() => setShowSanctionsModal(false)}
            />

            <ManageBooksModal
                isOpen={showManageBooksModal}
                onClose={() => setShowManageBooksModal(false)}
                onEdit={(book) => {
                    setSelectedBookForEdit(book);
                    setShowNewBookModal(true);
                }}
            />

            <NewBookModal
                isOpen={showNewBookModal}
                onClose={() => {
                    setShowNewBookModal(false);
                    setSelectedBookForEdit(null);
                }}
                onSuccess={() => window.location.reload()}
                editData={selectedBookForEdit}
            />
        </div>
    );
};
