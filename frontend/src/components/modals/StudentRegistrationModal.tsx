import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

interface StudentRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (userData: { numeroDocumento: string; tipo: 'student' }) => void;
}

interface School {
    escuelaId: number;
    nombre: string;
    facultadId: number;
}

interface Facultad {
    facultadId: number;
    nombre: string;
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        facultad: '',
        escuelaId: ''
    });
    const [faculties, setFaculties] = useState<Facultad[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.facultad) {
            const filtered = schools.filter(s => s.facultadId.toString() === formData.facultad);
            setFilteredSchools(filtered);
            // Reset escuela if it's not in the new filtered list
            if (!filtered.some(s => s.escuelaId.toString() === formData.escuelaId)) {
                setFormData(prev => ({ ...prev, escuelaId: '' }));
            }
        } else {
            setFilteredSchools([]);
        }
    }, [formData.facultad, schools]);

    const fetchInitialData = async () => {
        try {
            const [facRes, escRes] = await Promise.all([
                api.get<Facultad[]>('/facultad'),
                api.get<School[]>('/escuela')
            ]);
            setFaculties(facRes.data);
            setSchools(escRes.data);
        } catch (err) {
            console.error('Error fetching registration data:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { facultad, ...rest } = formData;
            const payload = {
                ...rest,
                escuelaId: parseInt(formData.escuelaId)
            };

            await api.post('/estudiante', payload);
            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess({ numeroDocumento: formData.numeroDocumento, tipo: 'student' });
                }
                handleClose();
            }, 1500);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Error al registrar estudiante');
            } else {
                setError('Error al registrar estudiante');
            }
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            tipoDocumento: 'DNI',
            numeroDocumento: '',
            facultad: '',
            escuelaId: ''
        });
        setError('');
        setSuccess(false);
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <User size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1">Registro de Estudiante</h2>
                                    <p className="text-blue-100">Completa el formulario para crear tu cuenta</p>
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
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <CheckCircle className="text-blue-600 w-20 h-20 mb-4" />
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h3>
                                        <p className="text-slate-500">Iniciando sesión...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Personal Information */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <User size={20} className="text-blue-600" />
                                                Información Personal
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Nombre *</label>
                                                    <input
                                                        type="text"
                                                        name="nombre"
                                                        value={formData.nombre}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Apellido Paterno *</label>
                                                    <input
                                                        type="text"
                                                        name="apellidoPaterno"
                                                        value={formData.apellidoPaterno}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Apellido Materno</label>
                                                    <input
                                                        type="text"
                                                        name="apellidoMaterno"
                                                        value={formData.apellidoMaterno}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Document */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-4">Documento</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Documento *</label>
                                                    <select
                                                        name="tipoDocumento"
                                                        value={formData.tipoDocumento}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                    >
                                                        <option value="DNI">DNI</option>
                                                        <option value="PASAPORTE">Pasaporte</option>
                                                        <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Número de Documento *</label>
                                                    <input
                                                        type="text"
                                                        name="numeroDocumento"
                                                        value={formData.numeroDocumento}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Academic */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <BookOpen size={20} className="text-blue-600" />
                                                Información Académica
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Facultad *</label>
                                                    <select
                                                        name="facultad"
                                                        value={formData.facultad}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                    >
                                                        <option value="">-- Seleccione una facultad --</option>
                                                        {faculties.map(fac => (
                                                            <option key={fac.facultadId} value={fac.facultadId}>
                                                                {fac.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Escuela *</label>
                                                    <select
                                                        name="escuelaId"
                                                        value={formData.escuelaId}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={!formData.facultad}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">-- Seleccione una escuela --</option>
                                                        {filteredSchools.map(school => (
                                                            <option key={school.escuelaId} value={school.escuelaId}>
                                                                {school.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Registrando...
                                                </>
                                            ) : (
                                                'Crear Cuenta'
                                            )}
                                        </button>
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
