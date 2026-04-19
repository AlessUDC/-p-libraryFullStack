import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UserProfileModal } from '../modals/UserProfileModal';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="sticky top-0 z-50 glass-panel border-x-0 border-t-0 rounded-none shadow-none backdrop-blur-2xl bg-slate-900/60">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center border border-indigo-400/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                                <BookOpen className="text-indigo-300 w-5 h-5" />
                            </div>
                            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 hidden sm:block tracking-tight">Nexus</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to={user?.role === 'student' ? '/student' : '/librarian'} className="text-slate-300 hover:text-indigo-400 font-semibold tracking-wide transition-colors">Panel Principal</Link>
                            {user?.role === 'student' && (
                                <Link to="/student" className="text-slate-300 hover:text-indigo-400 font-semibold tracking-wide transition-colors">Catálogo Cósmico</Link>
                            )}
                            <div className="h-8 w-px bg-slate-700 mx-2" />
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{user?.role === 'student' ? 'Estudiante' : 'Bibliotecario'}</p>
                                    <p className="text-sm font-bold text-slate-100">{user?.profile?.firstName} {user?.profile?.paternalLastName} {user?.profile?.maternalLastName}</p>
                                </div>
                                <button
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700 hover:bg-slate-700 hover:border-indigo-400 transition-all cursor-pointer"
                                    title="Ver perfil"
                                >
                                    <User className="text-indigo-300 w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all border border-transparent hover:border-red-900/50"
                                    title="Cerrar sesión"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-slate-300"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900/95 backdrop-blur-3xl border-t border-slate-800 p-4 space-y-4 shadow-2xl absolute w-full left-0">
                        <Link to={user?.role === 'student' ? '/student' : '/librarian'} className="block px-4 py-3 text-slate-200 font-bold hover:bg-white/5 rounded-xl">Panel Principal</Link>
                        {user?.role === 'student' && (
                            <Link to="/student" className="block px-4 py-3 text-slate-200 font-bold hover:bg-white/5 rounded-xl">Catálogo Cósmico</Link>
                        )}
                        <div className="border-t border-slate-800 pt-4 flex items-center justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsProfileModalOpen(true);
                                }}
                                className="flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                    <User className="text-indigo-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-100">{user?.profile?.firstName} {user?.profile?.paternalLastName} {user?.profile?.maternalLastName}</p>
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase">{user?.role === 'student' ? 'Estudiante' : 'Bibliotecario'}</p>
                                </div>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-400 font-bold hover:bg-red-950/50 rounded-xl transition-all border border-red-900/30"
                            >
                                <LogOut size={20} />
                                Salir
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* User Profile Modal moved outside nav to prevent fixed inset-0 issue with backdrop-blur */}
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
};
