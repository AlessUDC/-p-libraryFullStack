import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, CheckCircle, XCircle, X } from 'lucide-react';
import { studentService } from '../../services/studentService';
import type { Student } from '../../services/studentService';

interface SanctionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SanctionsModal: React.FC<SanctionsModalProps> = ({ isOpen, onClose }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchStudents = async () => {
                try {
                    const data = await studentService.getAll();
                    setStudents(data);
                } catch (error) {
                    console.error('Error fetching students:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStudents();
        }
    }, [isOpen]);

    const filteredStudents = students.filter(student =>
        (student.user?.penalties?.filter(p => p.status === 'ACTIVE').length || 0) > 0 && (
            student.user.userData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user.userData.paternalLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user.userData.maternalLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user.userData.documentNumber.includes(searchTerm)
        )
    );

    const handleRemoveSanction = async (studentId: string) => {
        try {
            await studentService.removeSanction(studentId);
            const updatedStudent = await studentService.getOne(studentId);
            setStudents(prev => prev.map(s =>
                s.userId === studentId ? updatedStudent : s
            ));
        } catch (error) {
            console.error('Error removing sanction:', error);
            alert('Error al quitar la sanción');
        }
    };

    const handleAddSanction = async (studentId: string) => {
        try {
            await studentService.addSanction(studentId);
            const updatedStudent = await studentService.getOne(studentId);
            setStudents(prev => prev.map(s =>
                s.userId === studentId ? updatedStudent : s
            ));
        } catch (error) {
            console.error('Error adding sanction:', error);
            alert('Error al añadir la sanción');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="bg-linear-to-br from-red-600 to-red-700 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md border border-white/20">
                                        <AlertTriangle size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black mb-1">Gestionar Sanciones</h2>
                                        <p className="text-red-100 text-sm font-medium opacity-90">Administra las sanciones aplicadas a los estudiantes</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar estudiante por nombre o DNI..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                                    </div>
                                ) : filteredStudents.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredStudents.map((student) => (
                                            <div
                                                key={student.userId}
                                                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                {student.user.userData.firstName} {student.user.userData.paternalLastName} {student.user.userData.maternalLastName}
                                                            </h3>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.user.userData.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                                }`}>
                                                                {student.user.userData.isActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium uppercase">DNI</p>
                                                                <p className="text-sm font-bold text-slate-900">{student.user.userData.documentNumber}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium uppercase">Escuela</p>
                                                                <p className="text-sm font-bold text-slate-900">{student.school.title}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium uppercase">Facultad</p>
                                                                <p className="text-sm font-bold text-slate-900">{student.school.faculty.title}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium uppercase">Sanciones</p>
                                                                <div className="flex items-center gap-2">
                                                                    <AlertTriangle className="text-red-600" size={16} />
                                                                    <p className="text-sm font-black text-red-600">{student.user?.penalties?.filter(p => p.status === 'ACTIVE').length || 0}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        <button
                                                            onClick={() => handleRemoveSanction(student.userId)}
                                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Quitar Sanción
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddSanction(student.userId)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
                                                        >
                                                            <XCircle size={16} />
                                                            Añadir Sanción
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <AlertTriangle className="text-slate-300 w-16 h-16 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium">
                                            {searchTerm ? 'No se encontraron estudiantes con sanciones' : 'No hay estudiantes sancionados actualmente'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                <p className="text-sm text-center text-slate-500 font-medium">
                                    {filteredStudents.length} estudiante(s) con sanciones
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
