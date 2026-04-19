import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, GraduationCap } from 'lucide-react';
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
                    />

                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="glass-panel max-w-lg w-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            {/* Header */}
                            <div className={`p-10 text-white relative overflow-hidden shrink-0 bg-gradient-to-br ${isStudent ? 'from-indigo-600/30 to-purple-600/20' : 'from-violet-600/30 to-fuchsia-600/20'}`}>
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
                                <div className="space-y-10">
                                    {/* Personal Identity Info */}
                                    <div className="space-y-5">
                                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Identidad Ciudadana</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 glass-panel bg-white/2 rounded-3xl border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Documento ({profile.documentType})</p>
                                                <p className="text-base font-bold text-slate-100">{profile.documentNumber}</p>
                                            </div>
                                            <div className="p-5 glass-panel bg-white/2 rounded-3xl border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Código Institucional</p>
                                                <p className="text-base font-bold text-slate-100">{user.id.split('-')[0]}...{user.id.slice(-4)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact & Personal */}
                                    <div className="space-y-5">
                                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] ml-1">Contacto y Enlace</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 glass-panel bg-white/2 rounded-3xl border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Móvil</p>
                                                <p className="text-base font-bold text-slate-100">{profile.mobilePhone || 'No registrado'}</p>
                                            </div>
                                            <div className="p-5 glass-panel bg-white/2 rounded-3xl border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Correo</p>
                                                <p className="text-sm font-bold text-slate-100 truncate">{profile.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {isStudent && (
                                        <>
                                            {/* Academic Info */}
                                            <div className="space-y-5">
                                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Estructura Académica</h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="flex items-center gap-5 p-5 glass-panel bg-white/2 rounded-3xl border-white/5">
                                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                            <GraduationCap size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Escuela / Facultad</p>
                                                            <p className="text-base font-bold text-slate-100 italic">
                                                                {'school' in profile ? profile.school.title : 'General'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
