import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi';
import { BookOpen, User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginPage = () => {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { token, user } = await loginUser({ code, password });
            if (token && user) {
                login(token, user.userId, user.role, user.profile);
                if (user.role === 'student') {
                    navigate('/student');
                } else if (user.role === 'teacher') {
                    navigate('/teacher');
                } else {
                    navigate('/librarian');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Error al verificar las credenciales. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden">
                    {/* Inner highlight */}
                    <div className="absolute inset-0 border-t border-l border-white/10 rounded-[2.5rem] pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-10 relative z-10">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-500/30 backdrop-blur-xl">
                            <BookOpen className="text-indigo-400 w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 tracking-tight">Nexus</h1>
                        <p className="text-slate-400 mt-2 font-medium tracking-wide">Acceso Seguro</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-start gap-3 backdrop-blur-md"
                            >
                                <AlertCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-200 font-medium">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 glass-input font-medium"
                                    placeholder="Código de Usuario"
                                    disabled={loading}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 glass-input font-medium"
                                    placeholder="Contraseña"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 glass-button rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={22} />
                                    Autenticando...
                                </>
                            ) : (
                                <>
                                    Ingresar al Sistema <ArrowRight size={22} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center relative z-10 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                            <button type="button" onClick={() => navigate('/auth/forgot-password')} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">¿Olvidaste tu contraseña?</button>
                            <button type="button" onClick={() => navigate('/auth/register')} className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">Crear una cuenta</button>
                        </div>
                        <p className="text-slate-500 text-xs font-medium mt-2">¿Inconvenientes? Contacta a la administración.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
