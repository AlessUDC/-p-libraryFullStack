import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookPlus, Loader2, CheckCircle, AlertCircle, User as UserIcon, Building2, Tag, MapPin, Hash, Plus, Trash2, Calendar, Filter } from 'lucide-react';
import api from '../../api/axios';
import type { Book } from '../../services/bookService';

interface AuthorInput {
    firstName: string;
    lastName: string;
    middleName: string;
}

interface NewBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editData?: Book | null;
}

export const NewBookModal: React.FC<NewBookModalProps> = ({ isOpen, onClose, onSuccess, editData }) => {
    const [formData, setFormData] = useState({
        title: '',
        publisher: '',
        location: '',
        copyCount: 1,
        isbn: '',
        publicationYear: new Date().getFullYear(),
        edition: '1st',
        language: 'Spanish'
    });
    
    const [authors, setAuthors] = useState<AuthorInput[]>([{ firstName: '', lastName: '', middleName: '' }]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [publishers, setPublishers] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, pubRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/publishers')
                ]);
                setCategories(catRes.data);
                setPublishers(pubRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };

        if (isOpen) {
            fetchData();
            if (editData) {
                setFormData({
                    title: editData.title,
                    publisher: editData.publisher?.title || '',
                    location: editData.copies?.[0]?.location || '',
                    copyCount: editData.copies?.length || 1,
                    isbn: editData.isbn || '',
                    publicationYear: editData.publicationYear || new Date().getFullYear(),
                    edition: editData.edition || '1st',
                    language: editData.language || 'Spanish'
                });
                setAuthors(editData.authors?.map(a => ({
                    firstName: a.author.firstName,
                    lastName: a.author.lastName,
                    middleName: a.author.middleName || ''
                })) || [{ firstName: '', lastName: '', middleName: '' }]);
                setSelectedCategories(editData.categories?.map(c => c.category.categoryId) || []);
            } else {
                resetForm();
            }
        }
    }, [isOpen, editData]);

    const resetForm = () => {
        setFormData({
            title: '',
            publisher: '',
            location: '',
            copyCount: 1,
            isbn: '',
            publicationYear: new Date().getFullYear(),
            edition: '1st',
            language: 'Spanish'
        });
        setAuthors([{ firstName: '', lastName: '', middleName: '' }]);
        setSelectedCategories([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'copyCount' || name === 'publicationYear' ? parseInt(value) || 0 : value
        }));
    };

    const handleAuthorChange = (index: number, field: keyof AuthorInput, value: string) => {
        const newAuthors = [...authors];
        newAuthors[index] = { ...newAuthors[index], [field]: value };
        setAuthors(newAuthors);
    };

    const addAuthorRow = () => {
        setAuthors([...authors, { firstName: '', lastName: '', middleName: '' }]);
    };

    const removeAuthorRow = (index: number) => {
        if (authors.length > 1) {
            setAuthors(authors.filter((_, i) => i !== index));
        }
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mapping for NestJS backend
            const payload = {
                title: formData.title,
                isbn: formData.isbn,
                publicationYear: formData.publicationYear,
                edition: formData.edition,
                language: formData.language,
                publisherTitle: formData.publisher,
                authors: authors.map(a => ({
                    firstName: a.firstName,
                    lastName: a.lastName,
                    middleName: a.middleName
                })),
                categoriesIds: selectedCategories,
                initialLocation: formData.location,
                initialCopyCount: formData.copyCount
            };

            if (editData) {
                await api.patch(`/books/${editData.bookId}`, payload);
            } else {
                await api.post('/books', payload);
            }

            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error("Error creating/editing book", err);
            setError(err.response?.data?.message || 'Ocurrió un error al procesar la obra');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setSuccess(false);
            setError('');
            onClose();
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
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="fixed inset-0 flex items-center justify-center pointer-events-none z-60 p-4"
                    >
                        <div className="glass-panel w-full max-w-2xl rounded-[2.5rem] pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] border-white/10">
                            {/* Header */}
                            <div className="bg-linear-to-br from-indigo-600/20 to-purple-600/10 p-8 flex items-center justify-between shrink-0 border-b border-white/5">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-indigo-600/30 rounded-2xl border border-indigo-400/30 shadow-xl shadow-indigo-500/10">
                                        <BookPlus size={28} className="text-indigo-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">{editData ? 'Actualizar Obra' : 'Registrar Nueva Obra'}</h2>
                                        <p className="text-slate-400 text-xs font-medium mt-1">Ingresa los metadatos de la publicación interestelar</p>
                                    </div>
                                </div>
                                <button onClick={handleClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                {success ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                            <CheckCircle className="text-emerald-400" size={48} />
                                        </div>
                                        <h3 className="text-3xl font-black text-white tracking-tight">¡Sincronización Exitosa!</h3>
                                        <p className="text-slate-400 mt-3 font-medium">La obra ha sido incorporada al catálogo maestro.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {error && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-950/30 border border-red-500/30 p-5 rounded-2xl flex items-center gap-4">
                                                <AlertCircle className="text-red-400 shrink-0" size={24} />
                                                <p className="text-sm text-red-200 font-bold">{error}</p>
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Title */}
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <Tag size={14} /> Título de la Obra
                                                </label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    className="w-full glass-input px-5 py-4 text-lg"
                                                    placeholder="Ej: Crítica de la Razón Pura"
                                                />
                                            </div>

                                            {/* ISBN & Year */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <Hash size={14} /> ISBN
                                                </label>
                                                <input
                                                    type="text"
                                                    name="isbn"
                                                    required
                                                    value={formData.isbn}
                                                    onChange={handleChange}
                                                    className="w-full glass-input px-5 py-4"
                                                    placeholder="Ej: 978-..."
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <Calendar className="text-indigo-400" size={14} /> Año
                                                </label>
                                                <input
                                                    type="number"
                                                    name="publicationYear"
                                                    required
                                                    value={formData.publicationYear}
                                                    onChange={handleChange}
                                                    className="w-full glass-input px-5 py-4"
                                                />
                                            </div>

                                            {/* Authors */}
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                        <UserIcon size={14} /> Autores
                                                    </label>
                                                    <button type="button" onClick={addAuthorRow} className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1 font-black uppercase tracking-tighter transition-all">
                                                        <Plus size={12} /> Añadir Colaborador
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {authors.map((aut, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white/2 rounded-2xl border border-white/5 relative group transition-all hover:bg-white/4">
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="Nombre"
                                                                value={aut.firstName}
                                                                onChange={(e) => handleAuthorChange(idx, 'firstName', e.target.value)}
                                                                className="glass-input px-4 py-3 text-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="Apellido"
                                                                value={aut.lastName}
                                                                onChange={(e) => handleAuthorChange(idx, 'lastName', e.target.value)}
                                                                className="glass-input px-4 py-3 text-sm"
                                                            />
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Seg. Apellido"
                                                                    value={aut.middleName}
                                                                    onChange={(e) => handleAuthorChange(idx, 'middleName', e.target.value)}
                                                                    className="glass-input px-4 py-3 text-sm flex-1"
                                                                />
                                                                {authors.length > 1 && (
                                                                    <button type="button" onClick={() => removeAuthorRow(idx)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Categories */}
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <Filter size={14} /> Categorías
                                                </label>
                                                <div className="space-y-4">
                                                    <select
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val && !selectedCategories.includes(val)) {
                                                                toggleCategory(val);
                                                            }
                                                            e.target.value = "";
                                                        }}
                                                        className="w-full glass-input px-5 py-4 text-slate-300"
                                                    >
                                                        <option value="" className="bg-slate-900 uppercase font-black text-[10px]">-- Seleccionar Categoría --</option>
                                                        {categories
                                                            .filter(cat => !selectedCategories.includes(cat.categoryId))
                                                            .map(cat => (
                                                                <option key={cat.categoryId} value={cat.categoryId} className="bg-slate-900">
                                                                    {cat.title}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>

                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedCategories.map(catId => {
                                                            const cat = categories.find(c => c.categoryId === catId);
                                                            return (
                                                                <div
                                                                    key={catId}
                                                                    className="px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 uppercase animate-in zoom-in"
                                                                >
                                                                    {cat?.title}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleCategory(catId)}
                                                                        className="hover:text-white transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Publisher & Location */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <Building2 size={14} /> Editorial
                                                </label>
                                                <input
                                                    type="text"
                                                    name="publisher"
                                                    required
                                                    value={formData.publisher}
                                                    onChange={handleChange}
                                                    className="w-full glass-input px-5 py-4"
                                                    placeholder="Ej: Siglo XXI"
                                                    list="publisher-list"
                                                />
                                                <datalist id="publisher-list">
                                                    {publishers.map(p => <option key={p.publisherId} value={p.title} />)}
                                                </datalist>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <MapPin size={14} /> Ubicación
                                                </label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    required
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className="w-full glass-input px-5 py-4"
                                                    placeholder="Ej: Pasillo 3, Ala B"
                                                />
                                            </div>

                                            {!editData && (
                                                <div className="md:col-span-2 space-y-3">
                                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <Plus size={14} /> Cantidad de Ejemplares a Generar
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="copyCount"
                                                        required
                                                        min="1"
                                                        max="100"
                                                        value={formData.copyCount}
                                                        onChange={handleChange}
                                                        className="w-full glass-input px-5 py-4"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-8 border-t border-white/5">
                                            <button 
                                                type="submit" 
                                                disabled={loading || selectedCategories.length === 0} 
                                                className="w-full py-5 glass-button text-white text-lg rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed group"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Loader2 className="animate-spin" size={24} />
                                                        <span>Encriptando Datos...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <CheckCircle size={24} />
                                                        <span>{editData ? 'Actualizar Master Record' : 'Incorporar al Archivo'}</span>
                                                    </div>
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
