import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyResetToken } from '../../api/authApi';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VerifyResetTokenPage = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [status, setStatus] = useState<'input' | 'loading' | 'success' | 'error'>('input');
    const [message, setMessage] = useState('');
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto-focus first input on load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        // Move to next input if value is entered
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newPin = [...pin];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newPin[i] = char;
        });
        setPin(newPin);
        
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tokenString = pin.join('');
        
        if (tokenString.length !== 6) {
            setStatus('error');
            setMessage('Por favor, ingresa el código de 6 dígitos.');
            return;
        }

        setStatus('loading');
        try {
            const response = await verifyResetToken(tokenString);
            setStatus('success');
            setMessage(response.message || 'Código verificado con éxito.');
            setTimeout(() => navigate(`/auth/reset-password?token=${tokenString}`), 2000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'El código es inválido o ha expirado.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans p-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden text-center">
                    <div className="absolute inset-0 border-t border-l border-white/10 rounded-[2.5rem] pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-8 relative z-10">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                            <ShieldCheck className="text-indigo-400 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Verificar Código</h1>
                        <p className="text-slate-400 font-medium px-4">Ingresa el código de 6 dígitos enviado a tu correo.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'error' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-red-200">{message}</p>
                            </motion.div>
                        )}
                        {status === 'success' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="text-green-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-green-200">{message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {status !== 'success' && (
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="flex justify-between gap-2" onPaste={handlePaste}>
                                {pin.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        disabled={status === 'loading'}
                                        className="w-12 h-16 text-center text-2xl font-bold bg-slate-900/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white transition-all outline-hidden"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 glass-button rounded-2xl font-bold flex items-center justify-center gap-2 text-lg"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 className="animate-spin" size={22} /> Verificando...</>
                                ) : (
                                    'Verificar Código'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-4 relative z-10">
                        <Link to="/auth/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">
                            ¿No recibiste el código? Solicitar uno nuevo
                        </Link>
                        <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white font-medium transition-colors text-sm">
                            Volver al Inicio <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
