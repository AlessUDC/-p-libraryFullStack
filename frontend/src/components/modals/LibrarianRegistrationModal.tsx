import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../../api/axios';

interface LibrarianRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (userData: { id: number; tipo: 'librarian' }) => void;
}

export const LibrarianRegistrationModal: React.FC<LibrarianRegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [registeredId, setRegisteredId] = useState<number | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
            };

            const response = await api.post('/bibliotecario', payload);
            const newLibrarian = response.data;
            setRegisteredId(newLibrarian.bibliotecarioId);
            setSuccess(true);

            setTimeout(() => {
                if (onSuccess) onSuccess({ id: newLibrarian.bibliotecarioId, tipo: 'librarian' });
                handleClose();
            }, 3000);
        } catch (err: any) {
            console.error('Librarian registration error:', err);
            setError(err.response?.data?.message || 'Error al registrar bibliotecario. Intenta de nuevo.');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
        });
        setError('');
        setSuccess(false);
        setRegisteredId(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                            {/* Header */}
                            <div className="bg-linear-to-br from-violet-600 to-violet-700 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <BookOpen size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1 tracking-tight">Registro de Bibliotecario</h2>
                                    <p className="text-violet-100 italic">Únete al equipo de gestión de la biblioteca</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto flex-1">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="text-red-600 w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                )}

                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle className="text-emerald-600 w-12 h-12" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h3>
                                        <p className="text-slate-500 mb-6">El bibliotecario ha sido registrado correctamente.</p>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full shadow-inner">
                                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Tu ID de Acceso es:</p>
                                            <p className="text-3xl font-black text-violet-600 tracking-tight">{registeredId}</p>
                                            <p className="text-xs text-slate-400 mt-4 font-medium italic">
                                                Usa este ID para ingresar al sistema como bibliotecario.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Personal Information */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <User size={20} className="text-violet-600" />
                                                Información Personal
                                            </h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-700 ml-1">Nombre Completo *</label>
                                                    <input
                                                        type="text"
                                                        name="nombre"
                                                        required
                                                        value={formData.nombre}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                                        placeholder="Ej: Juan Antonio"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-slate-700 ml-1">Apellido Paterno *</label>
                                                        <input
                                                            type="text"
                                                            name="apellidoPaterno"
                                                            required
                                                            value={formData.apellidoPaterno}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                                            placeholder="García"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-slate-700 ml-1">Apellido Materno</label>
                                                        <input
                                                            type="text"
                                                            name="apellidoMaterno"
                                                            value={formData.apellidoMaterno}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                                            placeholder="López"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-4 flex gap-3">
                                            <Shield className="text-violet-600 shrink-0" size={20} />
                                            <p className="text-xs text-violet-800 font-medium leading-relaxed">
                                                Al completar este registro, se le asignará un ID único de bibliotecario. Asegúrese de guardarlo para su acceso diario.
                                            </p>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-[0.98] tracking-widest text-xs"
                                            >
                                                CANCELAR
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black hover:bg-violet-700 shadow-xl shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest text-xs"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={20} />
                                                        REGISTRANDO...
                                                    </>
                                                ) : (
                                                    'REGISTRARSE'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
