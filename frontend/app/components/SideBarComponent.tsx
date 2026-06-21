import { Link } from "react-router";
import ButtonLogOut from "./ButtonLogOut";
import type { User } from "~/types";

export default function SideBarComponent({ isOpen, toggle, supabase }: { isOpen: boolean; toggle: () => void; supabase: any }) {
    const navItems = [
        { name: 'Início', path: '/dashboard', icon: 'home' },
        { name: 'Meus Ativos', path: '/dashboard/wallet', icon: 'trending_up' },
        { name: 'Configurações', path: '/dashboard/settings', icon: 'settings' },
    ];

    return (
        <aside className="bg-violet-950" style={{ width: isOpen ? '13pc' : '4pc', color: 'white', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', padding: '1.5rem 1.5rem' }}>
                {isOpen && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>InvestAi</span>}
                <button onClick={toggle} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', paddingRight: '0.5pc' }} className="material-icons">
                    menu
                </button>
            </div>

            <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
                        <span className="material-icons" style={{ marginRight: isOpen ? '10px' : '0' }}>{item.icon}</span>
                        {isOpen && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid #374151', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#ef4444', cursor: 'pointer' }}>
                    <span className="material-icons" style={{ marginRight: isOpen ? '10px' : '0', cursor: 'pointer' }}>logout</span>
                    {isOpen && <ButtonLogOut supabase={supabase} />}
                </div>
            </div>
        </aside>
    )
}