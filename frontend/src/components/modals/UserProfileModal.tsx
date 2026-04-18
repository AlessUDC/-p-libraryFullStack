import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Building2, GraduationCap, AlertCircle, CheckCircle, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, getFullName } = useAuth();

    if (!user) return null;

    const isStudent = user.role === 'student';
    const profile = user.profile as any;
    const userData = (user as any).userData || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-60"
                    />

                    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="glass-panel max-w-lg w-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            {/* Header */}
                            <div className={`p-10 text-white relative overflow-hidden shrink-0 bg-linear-to-br ${isStudent ? 'from-indigo-600/30 to-purple-600/20' : 'from-violet-600/30 to-fuchsia-600/20'}`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all z-20 border border-white/10 hover:rotate-90"
                                >
                                    <X size={22} />
                                </button>
                                
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-xl">
                                        <User size={48} className="text-white/80" />
                                    </div>
                                    <h2 className="text-3xl font-black mb-2 tracking-tight uppercase leading-none">{getFullName()}</h2>
                                    <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${isStudent ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/20' : 'bg-violet-500/20 text-violet-300 border-violet-400/20'}`}>
                                        {isStudent ? 'Socio / Estudiante' : 'Master / Bibliotecario'}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white/1">
                                {isStudent ? (
                                    <div className="space-y-10">
                                        {/* Academic Info */}
                                        <div className="space-y-5">
                                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Estructura Académica</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-5 p-5 glass-panel bg-white/2 rounded-3xl border-white/5 group hover:bg-white/4 transition-all">
                                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                        <GraduationCap size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Escuela / Facultad</p>
                                                        <p className="text-base font-bold text-slate-100 leading-none">
                                                            {'school' in profile ? profile.school.title : 'General'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-5 p-5 glass-panel bg-white/2 rounded-3xl border-white/5 group hover:bg-white/4 transition-all">
                                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Nivel / Ciclo</p>
                                                        <p className="text-base font-bold text-slate-100 leading-none uppercase">
                                                            {'cycle' in profile ? profile.cycle : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Info */}
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="p-6 glass-panel bg-white/2 rounded-3xl border-white/5 text-center">
                                                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border ${userData?.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {userData?.isActive !== false ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                                                </div>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Estado Nodo</p>
                                                <p className={`text-xs font-black uppercase tracking-widest ${userData?.isActive !== false ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {userData?.isActive !== false ? 'ACTIVO' : 'SANCIONADO'}
                                                </p>
                                            </div>
                                            <div className="p-6 glass-panel bg-white/2 rounded-3xl border-white/5 text-center">
                                                <div className="w-14 h-14 mx-auto mb-4 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                                    <ShieldCheck size={28} />
                                                </div>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Puntaje / Logs</p>
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                                                    {'onTimeDeliveriesCount' in profile ? profile.onTimeDeliveriesCount : 0} Entregas
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="space-y-5">
                                            <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] ml-1">Perfil Operativo</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-5 p-5 glass-panel bg-white/2 rounded-3xl border-white/5">
                                                    <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 border border-violet-500/20">
                                                        <Briefcase size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Rango</p>
                                                        <p className="text-base font-bold text-slate-100">Administrador de Red</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-linear-to-br from-violet-600/20 to-indigo-600/10 p-8 rounded-4xl border border-violet-500/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                                            <div className="flex items-center gap-4 mb-4">
                                                <ShieldCheck size={18} className="text-violet-400" />
                                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Hash de Identificación</p>
                                            </div>
                                            <p className="text-2xl font-black text-white tracking-widest break-all font-mono opacity-80">{user.id}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
