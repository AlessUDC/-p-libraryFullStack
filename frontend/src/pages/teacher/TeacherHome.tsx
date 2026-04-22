import { useAuth } from '../../context/AuthContext';
import { Mail, Shield, Calendar, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeacherHome = () => {
    const { getFullName, user } = useAuth();

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Hero Section */}
            <header className="relative py-16 px-8 rounded-[3rem] overflow-hidden glass-panel border-indigo-500/10 mb-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] -ml-20 -mb-20" />
                
                <div className="relative z-10 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-none tracking-tighter mb-4">
                            Panel de Docente, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-emerald-300">{getFullName()}</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium">
                            Bienvenido a tu panel de control. Aquí podrás gestionar tu perfil docente y acceder a las herramientas del sistema.
                        </p>
                    </motion.div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 glass-panel p-8 rounded-3xl border-white/5 space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                            <GraduationCap className="text-indigo-400" size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">{getFullName()}</h3>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Docente</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} /> Email
                            </p>
                            <p className="text-white font-medium">{user?.profile.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} /> Código
                            </p>
                            <p className="text-white font-medium">{user?.id}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats/Info */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-3xl p-8 rounded-4xl border border-white/5">
                        <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest mb-4">Información del Sistema</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-400/20">
                                    <Calendar size={16} className="text-indigo-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Estado Activo</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Cuenta verificada</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
