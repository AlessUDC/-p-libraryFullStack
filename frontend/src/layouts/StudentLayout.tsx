import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';

export const StudentLayout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}
