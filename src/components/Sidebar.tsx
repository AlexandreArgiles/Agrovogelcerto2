import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map as MapIcon, ClipboardList, Package, Wrench, LogOut } from 'lucide-react';

interface SidebarProps {
  setAuth: (auth: boolean) => void;
}

export default function Sidebar({ setAuth }: SidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
  };

  // É AQUI QUE DEFINIMOS OS ITENS DO MENU
  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/clients', name: 'Clientes', icon: Users },
    { path: '/services', name: 'Serviços', icon: Wrench }, // <-- ABA DE SERVIÇOS ADICIONADA AQUI
    { path: '/map', name: 'Mapa', icon: MapIcon },
    { path: '/os', name: 'Ordens de Serviço', icon: ClipboardList },
    { path: '/stock', name: 'Estoque', icon: Package },
  ];

  return (
    <div className="w-64 bg-green-800 text-white flex flex-col h-full shadow-lg">
      <div className="p-6 flex items-center justify-center border-b border-green-700">
        <h2 className="text-2xl font-bold tracking-wider">AGRO VOGEL</h2>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Esta lógica mantém o botão da OS "aceso" mesmo quando estamos a ver os detalhes de uma OS específica
          const isActive = location.pathname === item.path || (item.path === '/os' && location.pathname.startsWith('/os/'));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-green-700 text-white shadow-md' 
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-green-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}