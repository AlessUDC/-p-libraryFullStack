import React from 'react';
import { motion } from 'framer-motion';
import { X, User, School, Award, AlertCircle } from 'lucide-react';

interface StudentProfile {
    estudianteId: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
    activo: boolean;
    sanciones: number;
    escuela: {
        nombre: string;
        facultad: {
            nombre: string;
        };
    };
}

interface LibrarianProfile {
    bibliotecarioId: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
}

interface UserProfileCardProps {
    profile: StudentProfile | LibrarianProfile;
    role: 'student' | 'librarian';
    onClose: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile, role, onClose }) => {
    const isStudent = role === 'student';
    const studentProfile = profile as StudentProfile;
    const librarianProfile = profile as LibrarianProfile;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-28 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        >
            <div className={`${isStudent ? 'bg-primary-600' : 'bg-emerald-600'} p-6 text-white relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {profile.nombre} {profile.apellidoPaterno} {profile.apellidoMaterno}
                        </h3>
                        <p className="text-xs text-white/80">
                            {isStudent ? 'Estudiante' : 'Bibliotecario'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <User className="text-slate-400 w-5 h-5 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">ID</p>
                            <p className="text-sm font-bold text-slate-900">
                                {isStudent ? studentProfile.estudianteId : librarianProfile.bibliotecarioId}
                            </p>
                        </div>
                    </div>

                    {isStudent && (
                        <>
                            <div className="flex items-start gap-3">
                                <School className="text-slate-400 w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Escuela</p>
                                    <p className="text-sm font-bold text-slate-900">{studentProfile.escuela.nombre}</p>
                                    <p className="text-xs text-slate-600">{studentProfile.escuela.facultad.nombre}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Award className="text-slate-400 w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Estado</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${studentProfile.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {studentProfile.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {studentProfile.sanciones > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 flex items-center gap-1">
                                                <AlertCircle size={12} /> {studentProfile.sanciones} sanción(es)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
