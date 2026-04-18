import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, Filter, CheckCircle } from 'lucide-react';

interface ReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
    const [reportType, setReportType] = useState('loans');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleGenerateReport = () => {
        // Aquí iría la lógica para generar el reporte
        alert(`Generando reporte de ${reportType} desde ${dateFrom} hasta ${dateTo}`);
    };

    const reportTypes = [
        { id: 'loans', label: 'Préstamos', desc: 'Historial de todos los préstamos' },
        { id: 'students', label: 'Estudiantes', desc: 'Listado de estudiantes activos' },
        { id: 'sanctions', label: 'Sanciones', desc: 'Reporte de sanciones aplicadas' },
        { id: 'inventory', label: 'Inventario', desc: 'Estado del inventario de libros' },
    ];

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
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="bg-linear-to-br from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <FileText size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1">Generar Reportes</h2>
                                    <p className="text-blue-100 text-sm">Exporta informes detallados del sistema</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    {/* Report Type Selection */}
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-3  flex items-center gap-2">
                                            <Filter size={16} />
                                            Tipo de Reporte
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {reportTypes.map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setReportType(type.id)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${reportType === type.id
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-slate-200 hover:border-blue-200'
                                                        }`}
                                                >
                                                    <p className="font-bold text-slate-900">{type.label}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-3  flex items-center gap-2">
                                            <Calendar size={16} />
                                            Rango de Fechas
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Desde</label>
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Hasta</label>
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Format Selection */}
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                        <h3 className="font-bold text-slate-900 mb-3">Formato de Exportación</h3>
                                        <div className="flex gap-3">
                                            <button className="flex-1 py-2 px-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                                PDF
                                            </button>
                                            <button className="flex-1 py-2 px-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                                Excel
                                            </button>
                                            <button className="flex-1 py-2 px-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleGenerateReport}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    <CheckCircle size={18} />
                                    Generar Reporte
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
