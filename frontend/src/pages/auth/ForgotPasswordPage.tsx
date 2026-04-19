import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authApi';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await forgotPassword(email);
            setMessage(response.message || 'Instrucciones enviadas. Revisa tu bandeja de entrada.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans p-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10">
                <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute inset-0 border-t border-l border-white/10 rounded-[2.5rem] pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-8 relative z-10 text-center">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-500/30 backdrop-blur-xl">
                            <Mail className="text-indigo-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-300 tracking-tight">Recuperar Acceso</h1>
                        <p className="text-slate-400 mt-2 font-medium">Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.</p>
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
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 glass-input font-medium"
                                    placeholder="Correo Electrónico"
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 glass-button rounded-2xl font-bold flex items-center justify-center gap-2 text-lg">
                                {loading ? <><Loader2 className="animate-spin" size={22} /> Enviando...</> : <><ArrowRight size={22} /> Enviar Enlace</>}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                        <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Volver al Inicio</Link>
                        <Link to="/auth/register" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">Crear una cuenta</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
