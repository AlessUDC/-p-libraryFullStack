import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    registerStudent, 
    registerTeacher, 
    registerLibrarian, 
    getFaculties, 
    getSchoolsByFaculty,
    getProvinces,
    getDistrictsByProvince
} from '../../api/authApi';
import { 
    UserPlus, User, BookOpen, GraduationCap, AlertCircle, 
    Loader2, CheckCircle2, MapPin, Contact, Calendar, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Role = 'STUDENT' | 'TEACHER' | 'LIBRARIAN';

interface Faculty { facultyId: string; title: string; }
interface School { schoolId: string; title: string; }
interface Province { provinceId: string; title: string; }
interface District { districtId: string; title: string; }

export const RegisterPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [role, setRole] = useState<Role>('STUDENT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Cascading Data
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    
    // Select Helpers
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        firstName: '',
        paternalLastName: '',
        maternalLastName: '',
        documentType: 'DNI',
        documentNumber: '',
        birthdate: '',
        email: '',
        password: '',
        code: '',
        mobilePhone: '',
        landlinePhone: '',
        address: '',
        districtId: '',
        maritalStatus: 'soltero',
        gender: 'male',
        // Role specifics
        cycle: '',
        schoolId: '',
        facultyId: '',
        department: '',
        specialization: '',
        shift: ''
    });

    // Fetch initial data (Faculties and Provinces)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [facs, provs] = await Promise.all([getFaculties(), getProvinces()]);
                setFaculties(facs);
                setProvinces(provs);
            } catch (err) {
                console.error('Error fetching initial data:', err);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch schools when faculty selected (for Student and Teacher)
    useEffect(() => {
        const facultyId = role === 'STUDENT' ? selectedFacultyId : formData.facultyId;
        if (facultyId) {
            getSchoolsByFaculty(facultyId).then(setSchools).catch(console.error);
        } else {
            setSchools([]);
        }
    }, [selectedFacultyId, formData.facultyId, role]);

    // Fetch districts when province selected
    useEffect(() => {
        if (selectedProvinceId) {
            getDistrictsByProvince(selectedProvinceId).then(setDistricts).catch(console.error);
        } else {
            setDistricts([]);
        }
    }, [selectedProvinceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Validación numérica para campos específicos
        const numericFields = ['mobilePhone', 'landlinePhone', 'code', 'cycle', 'documentNumber'];
        if (numericFields.includes(name)) {
            if (value !== '' && !/^\d+$/.test(value)) return;
        }

        // Validación para fecha (solo números) - Ya no es necesario para el datepicker nativo
        // pero lo mantenemos para otros campos si fuera necesario. 
        // Eliminamos la validación manual de birthdate que causaba conflictos con el formato nativo.

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string, resetField?: string) => {
        if (name === 'selectedFacultyId') {
            setSelectedFacultyId(value);
            setFormData(prev => ({ ...prev, facultyId: value }));
        }
        if (name === 'selectedProvinceId') {
            setSelectedProvinceId(value);
            setFormData(prev => ({ ...prev, districtId: '' }));
        }
        if (resetField) setFormData(prev => ({ ...prev, [resetField]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            let response;
            if (role === 'STUDENT') {
                response = await registerStudent(formData);
            } else if (role === 'TEACHER') {
                response = await registerTeacher(formData);
            } else if (role === 'LIBRARIAN') {
                if (!isAuthenticated || user?.role !== 'administrator') {
                    throw new Error('Solo los Administradores logueados pueden registrar un Bibliotecario.');
                }
                response = await registerLibrarian(formData);
            }
            setSuccessMessage(response?.message || 'Registro completado. Verifica tu correo.');
            setTimeout(() => navigate('/auth/confirm'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error en el registro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans py-16 px-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-4xl z-10">
                <div className="glass-panel p-8 md:p-12 rounded-[3rem] relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 border-t border-l border-white/10 rounded-[3rem] pointer-events-none" />
                    
                    <div className="flex flex-col items-center mb-10 relative z-10">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-500/30">
                            <UserPlus className="text-indigo-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Crea tu Cuenta</h1>
                        <p className="text-slate-400 mt-2 font-medium">Únete a la plataforma bibliotecaria Nexus</p>
                    </div>

                    <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-10 relative z-10">
                        {(['STUDENT', 'TEACHER', 'LIBRARIAN'] as Role[]).map((r) => (
                            <button key={r} type="button" onClick={() => setRole(r)} disabled={(r === 'LIBRARIAN' && isAuthenticated && user?.role !== 'administrator')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                                {r === 'STUDENT' ? <GraduationCap size={18} /> : r === 'TEACHER' ? <BookOpen size={18} /> : <User size={18} />}
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-center gap-3">
                                <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-red-200">{error}</p>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div key="success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-green-900/40 border border-green-500/30 rounded-2xl flex items-center gap-3">
                                <CheckCircle2 className="text-green-400 w-5 h-5 shrink-0" />
                                <p className="text-sm text-green-200">{successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                        {/* SECCIÓN 1: DATOS PERSONALES */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
                                <Info className="text-indigo-400 w-5 h-5" />
                                <h2 className="text-lg font-bold text-slate-200">Datos Personales</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <input type="text" name="firstName" required placeholder="Nombres *" className="glass-input p-4" value={formData.firstName} onChange={handleChange} />
                                <input type="text" name="paternalLastName" required placeholder="Apellido Paterno *" className="glass-input p-4" value={formData.paternalLastName} onChange={handleChange} />
                                <input type="text" name="maternalLastName" required placeholder="Apellido Materno *" className="glass-input p-4" value={formData.maternalLastName} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                                <div className="flex gap-2">
                                    <select name="documentType" value={formData.documentType} onChange={handleChange} className="w-32 glass-input px-2 bg-slate-900">
                                        <option value="DNI">DNI</option><option value="CE">C.E.</option><option value="PASAPORTE">PAS</option>
                                    </select>
                                    <input type="text" name="documentNumber" required placeholder="Número *" className="flex-1 glass-input p-4" value={formData.documentNumber} onChange={handleChange} />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none z-10" />
                                    <input 
                                        type="date" 
                                        name="birthdate" 
                                        required 
                                        className="w-full glass-input pl-12 pr-4 py-4 text-slate-200 schema-dark" 
                                        value={formData.birthdate} 
                                        onChange={handleChange} 
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {!formData.birthdate && (
                                        <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input px-2 bg-slate-900">
                                        <option value="male">Hombre</option><option value="female">Mujer</option><option value="other">Otro</option>
                                    </select>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="glass-input px-2 bg-slate-900">
                                        <option value="soltero">Soltero</option><option value="casado">Casado</option><option value="divorciado">Divorciado</option><option value="viudo">Viudo</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 2: UBICACIÓN Y CONTACTO */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
                                <MapPin className="text-indigo-400 w-5 h-5" />
                                <h2 className="text-lg font-bold text-slate-200">Ubicación y Contacto</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <select value={selectedProvinceId} onChange={(e) => handleSelectChange('selectedProvinceId', e.target.value)} className="glass-input p-4 bg-slate-900">
                                    <option value="">Seleccionar Provincia *</option>
                                    {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.title}</option>)}
                                </select>
                                <select name="districtId" required value={formData.districtId} onChange={handleChange} className="glass-input p-4 bg-slate-900" disabled={!selectedProvinceId}>
                                    <option value="">Seleccionar Distrito *</option>
                                    {districts.map(d => <option key={d.districtId} value={d.districtId}>{d.title}</option>)}
                                </select>
                            </div>
                            <input type="text" name="address" required placeholder="Dirección exacta (Av, Calle, Nro) *" className="w-full glass-input p-4 mt-5" value={formData.address} onChange={handleChange} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 text-sm">
                                <input type="text" name="mobilePhone" placeholder="Celular" className="glass-input p-4" value={formData.mobilePhone} onChange={handleChange} />
                                <input type="text" name="landlinePhone" placeholder="Teléfono Fijo" className="glass-input p-4" value={formData.landlinePhone} onChange={handleChange} />
                            </div>
                        </section>

                        {/* SECCIÓN 3: CUENTA Y ACADÉMICO */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
                                <Contact className="text-indigo-400 w-5 h-5" />
                                <h2 className="text-lg font-bold text-slate-200">Cuenta y Datos Académicos</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input type="email" name="email" required placeholder="Correo Electrónico *" className="glass-input p-4" value={formData.email} onChange={handleChange} />
                                <input type="password" name="password" required placeholder="Contraseña *" className="glass-input p-4" value={formData.password} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <input type="text" name="code" required placeholder="Código Universitario *" className="glass-input p-4" value={formData.code} onChange={handleChange} />
                                {role === 'STUDENT' && (
                                    <select name="cycle" required value={formData.cycle} onChange={handleChange} className="glass-input p-4 bg-slate-900">
                                        <option value="">Seleccionar Ciclo *</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={(i + 1).toString()}>
                                                Ciclo {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Selectores Académicos Dinámicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                {(role === 'STUDENT' || role === 'TEACHER') && (
                                    <select name="facultyId" required value={role === 'STUDENT' ? selectedFacultyId : formData.facultyId} 
                                        onChange={(e) => handleSelectChange(role === 'STUDENT' ? 'selectedFacultyId' : 'facultyId', e.target.value, role === 'STUDENT' ? 'schoolId' : undefined)} 
                                        className="glass-input p-4 bg-slate-900">
                                        <option value="">Seleccionar Facultad *</option>
                                        {faculties.map(f => <option key={f.facultyId} value={f.facultyId}>{f.title}</option>)}
                                    </select>
                                )}
                                {role === 'STUDENT' && (
                                    <select name="schoolId" required value={formData.schoolId} onChange={handleChange} className="glass-input p-4 bg-slate-900" disabled={!selectedFacultyId}>
                                        <option value="">Seleccionar Escuela *</option>
                                        {schools.map(s => <option key={s.schoolId} value={s.schoolId}>{s.title}</option>)}
                                    </select>
                                )}
                            </div>
                        </section>

                        <button type="submit" disabled={loading} className="w-full py-5 glass-button rounded-2xl font-bold flex items-center justify-center gap-3 text-lg mt-5">
                            {loading ? <><Loader2 className="animate-spin" size={24} /> Procesando...</> : <><UserPlus size={24} /> Crear Cuenta Ahora</>}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-900 text-center flex flex-col md:flex-row items-center justify-center gap-6">
                        <button type="button" onClick={() => navigate('/login')} className="text-slate-400 hover:text-white transition-colors">¿Ya tienes cuenta? Ingresa aquí</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
