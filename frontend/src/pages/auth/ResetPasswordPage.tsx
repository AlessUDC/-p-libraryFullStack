import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            setError('Token de recuperación no válido o inexistente.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await resetPassword({ token, newPassword });
            setMessage(response.message || 'Contraseña actualizada exitosamente.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="glass-panel p-10 rounded-[2.5rem] text-center max-w-md w-full">
                    <AlertCircle className="text-red-400 w-16 h-16 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-4">Enlace Inválido</h1>
                    <p className="text-slate-400 mb-8">No se encontró un token válido para restablecer la contraseña.</p>
                    <Link to="/auth/forgot-password" className="w-full block py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-white transition-colors">Volver a intentar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans p-4">
            <div className="absolute top-[-10%] left-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10">
                <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex flex-col items-center mb-8 relative z-10 text-center">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-500/30 backdrop-blur-xl">
                            <Lock className="text-indigo-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-300 tracking-tight">Nueva Contraseña</h1>
                        <p className="text-slate-400 mt-2 font-medium">Crea una nueva contraseña segura para tu cuenta.</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-red-200">{error}</p>
                            </motion.div>
                        )}
                        {message && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="text-green-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-green-200">{message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!message && (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 glass-input font-medium"
                                        placeholder="Nueva Contraseña"
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 glass-input font-medium"
                                        placeholder="Confirmar Contraseña"
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 glass-button rounded-2xl font-bold flex items-center justify-center gap-2 text-lg">
                                {loading ? <><Loader2 className="animate-spin" size={22} /> Guardando...</> : <><ArrowRight size={22} /> Restablecer Contraseña</>}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
