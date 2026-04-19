import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { confirmAccount } from '../../api/authApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const ConfirmAccountPage = () => {
    const navigate = useNavigate();
    
    const [searchParams] = useSearchParams();
    const hideResend = searchParams.get('hideResend') === 'true';

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

    const verifyToken = async (tokenString: string) => {
        setStatus('loading');
        try {
            const response = await confirmAccount(tokenString);
            setStatus('success');
            setMessage(response.message || 'Tu cuenta ha sido confirmada correctamente.');
            setTimeout(() => navigate('/login'), 4000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'El código de confirmación es inválido o ha expirado.');
        }
    };

    const handleChange = (index: number, value: string) => {
        // Allow only numbers
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        // Take only the last character if user types fast
        newPin[index] = value.slice(-1);
        setPin(newPin);

        // Auto-advance
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if all 6 filled
        if (newPin.every(digit => digit !== '')) {
            const tokenString = newPin.join('');
            verifyToken(tokenString);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            // Move back on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.some(char => !/^\d$/.test(char))) return; // Ensure only numbers

        const newPin = [...pin];
        pastedData.forEach((char, i) => {
            if (i < 6) newPin[i] = char;
        });
        setPin(newPin);

        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();

        if (newPin.every(digit => digit !== '')) {
            verifyToken(newPin.join(''));
        }
    };

    const retry = () => {
        setStatus('input');
        setPin(['', '', '', '', '', '']);
        setMessage('');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans p-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10">
                <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden text-center shadow-2xl">
                    <div className="absolute inset-0 border-t border-l border-white/10 rounded-[2.5rem] pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-6 relative z-10">
                        {status === 'input' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-500/30">
                                <ShieldCheck className="text-indigo-400 w-8 h-8" />
                            </motion.div>
                        )}
                        {status === 'loading' && (
                            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30 backdrop-blur-xl animate-pulse">
                                <Loader2 className="text-indigo-400 w-8 h-8 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/30">
                                <CheckCircle2 className="text-green-400 w-8 h-8" />
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-500/30">
                                <XCircle className="text-red-400 w-8 h-8" />
                            </motion.div>
                        )}
                        
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-300 tracking-tight">
                            Confirma tu Acceso
                        </h1>
                        <p className="text-slate-400 mt-3 text-sm font-medium">
                            {status === 'input' 
                                ? 'Hemos enviado un código de 6 dígitos a tu correo electrónico.'
                                : message}
                        </p>
                    </div>

                    {status === 'input' && (
                        <div className="flex justify-center gap-2 md:gap-3 my-8 relative z-10" onPaste={handlePaste}>
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                                    disabled={status !== 'input'}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-800/50 relative z-10 flex flex-col gap-4">
                        {status === 'success' ? (
                            <p className="text-indigo-400 text-sm font-semibold tracking-wide">Redirigiendo de forma segura...</p>
                        ) : status === 'error' ? (
                            <button onClick={retry} className="text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl font-bold transition-colors w-full">
                                Intentar de nuevo
                            </button>
                        ) : (
                            <>
                                {!hideResend && (
                                    <Link to="/auth/resend-confirm" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors mb-2">
                                        ¿No recibiste el código? Reenviar token
                                    </Link>
                                )}
                                <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white font-medium transition-colors text-sm">
                                    Volver al Inicio <ArrowRight size={16} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
