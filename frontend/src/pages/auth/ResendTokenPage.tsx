import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resendConfirmation } from '../../api/authApi';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ResendTokenPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'input' | 'loading' | 'success' | 'error'>('input');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setStatus('error');
            setMessage('Por favor, ingresa tu correo electrónico.');
            return;
        }

        setStatus('loading');
        try {
            const response = await resendConfirmation(email);
            setStatus('success');
            setMessage(response.message || 'Se ha enviado un nuevo token a tu correo.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Hubo un error al intentar reenviar el token.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans py-12 px-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute inset-0 border-t border-l border-white/10 rounded-[2.5rem] pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-8 relative z-10 text-center">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                            <Mail className="text-indigo-400 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Reenviar Token</h1>
                        <p className="text-slate-400 font-medium">Ingresa el correo asociado a tu cuenta para recibir un nuevo PIN de 6 dígitos.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'error' && (
                            <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-red-200">{message}</p>
                            </motion.div>
                        )}
                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="text-green-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-green-200">{message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {status !== 'success' && (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-4 glass-input font-medium"
                                    placeholder="Correo Electrónico"
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 glass-button rounded-2xl font-bold flex items-center justify-center gap-2 text-lg"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 className="animate-spin" size={22} /> Enviando...</>
                                ) : (
                                    'Solicitar nuevo PIN'
                                )}
                            </button>
                        </form>
                    )}

                </div>
            </motion.div>
        </div>
    );
};
