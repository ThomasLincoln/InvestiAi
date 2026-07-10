import { Link, useLocation, useNavigate } from 'react-router';

export default function MobileBottomNav({ supabase }: { supabase: any }) {
  const location = useLocation();
  const navigate = useNavigate();

  async function signOut() {
    if (supabase?.auth) {
      await supabase.auth.signOut();
      navigate('/');
    }
  }

  const navItems = [
    { name: 'Início', path: '/dashboard', icon: 'home' },
    { name: 'Ativos', path: '/dashboard/wallet', icon: 'trending_up' },
    { name: 'Ajustes', path: '/dashboard/settings', icon: 'settings' },
  ];

  function isActive(path: string) {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  }

  return (
    <nav
      className="sm:hidden fixed bottom-2 left-2 right-2 z-40 flex items-center justify-around
            rounded-2xl bg-linear-to-b from-violet-950 via-violet-950 to-indigo-950
            text-white shadow-xl shadow-violet-950/20 px-2 py-2"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`select-none flex flex-col items-center gap-0.5 flex-1 rounded-xl py-1.5
                            transition-colors duration-200
                            ${active ? 'text-white' : 'text-violet-300'}
                        `}
          >
            <span className={`material-icons text-xl ${active ? 'text-violet-300' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[11px] font-medium">{item.name}</span>
            {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-violet-400" />}
          </Link>
        );
      })}

      <button
        onClick={signOut}
        className="select-none flex flex-col items-center gap-0.5 flex-1 rounded-xl py-1.5
                    text-red-300 transition-colors duration-200"
      >
        <span className="material-icons text-xl">logout</span>
        <span className="text-[11px] font-medium">Sair</span>
      </button>
    </nav>
  );
}
