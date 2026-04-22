import { studentService } from '../../services/studentService';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    ArrowUpRight,
    Loader2,
    ShieldCheck,
    Settings,
    Activity
} from 'lucide-react';

export const LibrarianDashboard = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['librarian-dashboard'],
        queryFn: async () => {
            const students = await studentService.getAll();
            return { students };
        }
    });

    const students = data?.students || [];

    const stats = [
        { label: 'Usuarios Totales', value: students.length.toString(), icon: Users, color: 'from-indigo-600/20 to-indigo-400/10', textColor: 'text-indigo-400', trend: 'Miembros registrados' },
        { label: 'Sistemas', value: 'Online', icon: Activity, color: 'from-emerald-600/20 to-emerald-400/10', textColor: 'text-emerald-400', trend: 'Estado del servidor' },
        { label: 'Seguridad', value: 'Alta', icon: ShieldCheck, color: 'from-purple-600/20 to-purple-400/10', textColor: 'text-purple-400', trend: 'Protocolos activos' },
        { label: 'Configuración', value: 'V1.0', icon: Settings, color: 'from-slate-600/20 to-slate-400/10', textColor: 'text-slate-400', trend: 'Versión del sistema' },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Sincronizando con el servidor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 tracking-tight">Panel de Administración</h1>
                    <p className="text-slate-400 font-medium mt-1">Gestión centralizada del sistema.</p>
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

            <div className="flex justify-center pt-4">
                <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col border-indigo-500/10 w-full max-w-5xl shadow-2xl shadow-indigo-500/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Gestión de Usuarios</h2>
                        <p className="text-slate-400 text-base font-medium mb-8">Lista de miembros registrados en el sistema.</p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-4 px-4 text-xs font-black text-indigo-400 uppercase tracking-widest">Nombre</th>
                                        <th className="py-4 px-4 text-xs font-black text-indigo-400 uppercase tracking-widest">Código</th>
                                        <th className="py-4 px-4 text-xs font-black text-indigo-400 uppercase tracking-widest">Rol</th>
                                        <th className="py-4 px-4 text-xs font-black text-indigo-400 uppercase tracking-widest">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student: any) => (
                                        <tr key={student.userId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                            <td className="py-4 px-4 text-white font-medium">
                                                {student.user.userData.firstName} {student.user.userData.lastName}
                                            </td>
                                            <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                                                {student.user.code}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg font-black uppercase">
                                                    {student.user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2" />
                                                <span className="text-xs text-slate-300 font-bold uppercase tracking-tight">Activo</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
