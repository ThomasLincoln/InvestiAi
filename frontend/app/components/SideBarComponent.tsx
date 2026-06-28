import { Link, useLocation } from "react-router";
import ButtonLogOut from "./ButtonLogOut";

export default function SideBarComponent({ isOpen, toggle, supabase }: { isOpen: boolean; toggle: () => void; supabase: any }) {
    const location = useLocation();

    const navItems = [
        { name: 'Início', path: '/dashboard', icon: 'home' },
        { name: 'Meus Ativos', path: '/dashboard/wallet', icon: 'trending_up' },
        { name: 'Configurações', path: '/dashboard/settings', icon: 'settings' },
    ];

    function isActive(path: string) {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
        }
        return location.pathname.startsWith(path);
    }

    return (
        <aside className={`
            relative flex flex-col shrink-0
            bg-linear-to-b from-violet-950 via-violet-950 to-indigo-950
            text-white rounded-2xl shadow-xl shadow-violet-950/20
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-60' : 'w-16'}
        `}>
            <div className={`
                flex items-center h-16 px-4
                border-b border-white/10
                ${isOpen ? 'justify-between' : 'justify-center'}
            `}>
                {isOpen && (
                    <span className="text-lg font-bold tracking-tight bg-linear-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                        InvestAí
                    </span>
                )}
                <button
                    onClick={toggle}
                    className="select-none flex items-center justify-center w-9 h-9 rounded-lg text-violet-300 hover:text-white hover:bg-white/10 transition-colors duration-200 material-icons text-xl"
                >
                    {isOpen ? 'menu_open' : 'menu'}
                </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={!isOpen ? item.name : undefined}
                            className={`select-none 
                                group relative flex items-center gap-3 rounded-xl
                                transition-all duration-200
                                ${isOpen ? 'px-3 py-2.5' : 'justify-center py-2.5'}
                                ${active
                                    ? 'bg-white/15 text-white shadow-lg shadow-violet-500/10'
                                    : 'text-violet-300 hover:bg-white/8 hover:text-white'
                                }
                            `}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-violet-400 rounded-r-full" />
                            )}
                            <span className={`material-icons text-xl ${active ? 'text-violet-300' : 'group-hover:text-violet-200'}`}>
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className={`text-sm font-medium whitespace-nowrap ${active ? 'text-white' : ''}`}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-white/10">
                <button
                    onClick={() => document.querySelector<HTMLButtonElement>('#logout-btn')?.click()}
                    title={!isOpen ? 'Sair' : undefined}
                    className={`
                        select-none 
                        group flex items-center gap-3 w-full rounded-xl
                        text-red-300 hover:bg-red-500/15 hover:text-red-200
                        transition-all duration-200
                        ${isOpen ? 'px-3 py-2.5' : 'justify-center py-2.5'}
                    `}
                >
                    <span className="material-icons text-xl">logout</span>
                    {isOpen && <span className="text-sm font-medium">Sair</span>}
                </button>
                <div className="hidden">
                    <ButtonLogOut supabase={supabase} />
                </div>
            </div>
        </aside>
    );
}
