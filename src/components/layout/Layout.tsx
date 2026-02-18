import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, FilePlus, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
    { to: '/', end: true, icon: LayoutDashboard, label: 'Overview' },
    { to: '/cases', end: false, icon: FolderKanban, label: 'PI Cases' },
    { to: '/analytics', end: false, icon: BarChart3, label: 'PI Recovery Analytics' },
];

const Layout: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();

    // Close drawer on route change
    React.useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        clsx(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm min-h-[44px]',
            isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        );

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="h-16 md:h-20 flex items-center px-4 md:px-6 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <img src="/favicon.png" alt="MedPayRez" className="w-8 h-8 rounded-sm flex-shrink-0" />
                    <div className="min-w-0 leading-tight">
                        <span className="block font-bold text-sm tracking-tight text-slate-900">MedPayRez</span>
                        <span className="block font-semibold text-xs text-blue-500 tracking-wide">Provider</span>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_LINKS.map(({ to, end, icon: Icon, label }) => (
                    <NavLink key={to} to={to} end={end} className={navLinkClass}>
                        <Icon size={20} className="flex-shrink-0" />
                        <span>{label}</span>
                    </NavLink>
                ))}

                <div className="pt-2">
                    <NavLink
                        to="/intake"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border-2 border-dashed border-blue-200 hover:border-blue-400 min-h-[44px]',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            )
                        }
                    >
                        <FilePlus size={20} className="flex-shrink-0" />
                        <span>New Case Intake</span>
                    </NavLink>
                </div>
            </nav>

            {/* Status Footer */}
            <div className="p-4 border-t border-slate-100 flex-shrink-0">
                <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Provider Portal</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-600">System Online</span>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            {/* ── DESKTOP SIDEBAR (≥768px) ── */}
            <aside className="hidden md:flex w-56 xl:w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-20">
                <SidebarContent />
            </aside>

            {/* ── MOBILE DRAWER OVERLAY ── */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close menu"
                />
            )}

            {/* ── MOBILE DRAWER PANEL ── */}
            <aside
                className={clsx(
                    'fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 flex flex-col z-40 md:hidden',
                    'transition-transform duration-300 ease-in-out',
                    drawerOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                )}
            >
                {/* Close button inside drawer */}
                <button
                    onClick={() => setDrawerOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
                <SidebarContent />
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col md:ml-56 xl:ml-64 min-w-0">

                {/* Mobile top bar */}
                <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/favicon.png" alt="MedPayRez" className="w-6 h-6 rounded-sm" />
                        <span className="font-bold text-sm tracking-tight text-slate-900">
                            MedPayRez<span className="text-blue-500">Provider</span>
                        </span>
                    </div>
                    {/* Spacer to center logo */}
                    <div className="w-10" />
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
