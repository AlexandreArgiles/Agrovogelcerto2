import React, { useMemo, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, List, LogOut, Home, Users, Wrench, Menu, X, DollarSign, Car, Shield, Sparkles, ChevronRight } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Outlet />;
  }

  const navItems = [
    { path: '/', name: 'Painel', icon: Home, description: 'Resumo geral' },
    { path: '/os', name: 'Ordens de Servico', icon: List, description: 'Acompanhar OS' },
    { path: '/finance', name: 'Financeiro', icon: DollarSign, description: 'Custos e ganhos' },
    { path: '/clients', name: 'Clientes', icon: Users, description: 'Base de atendimento' },
    { path: '/services', name: 'Servicos', icon: Wrench, description: 'Catalogo e valores' },
    { path: '/map', name: 'Mapa', icon: Map, description: 'Operacao em campo' },
    { path: '/vehicles', name: 'Frota', icon: Car, description: 'Veiculos e gastos' },
    { path: '/technicians', name: 'Tecnicos', icon: Wrench, description: 'Equipe tecnica' },
    { path: '/users', name: 'Usuarios', icon: Shield, description: 'Acessos internos' }
  ];

  const currentItem = useMemo(() => (
    navItems.find((item) => location.pathname === item.path || (item.path === '/os' && location.pathname.startsWith('/os/')))
  ), [location.pathname]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      <div className="md:hidden bg-[var(--brand-900)] text-white p-4 flex justify-between items-center shadow-md z-40 relative">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles size={18} className="text-[var(--brand-900)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">AGROVOGEL</h1>
            <p className="text-[11px] text-green-100/75">Operacao e atendimento</p>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-green-200 focus:outline-none">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[linear-gradient(180deg,#0a5c36_0%,#084a2b_100%)] text-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 hidden md:flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mb-3 shadow-md">
            <Sparkles size={28} className="text-[var(--brand-900)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">AGROVOGEL</h1>
          <p className="text-xs text-[#c5ec8e] font-medium tracking-[0.2em] mt-1 uppercase">Gestao operacional</p>
        </div>

        <div className="px-4 py-4 bg-black/10 text-sm flex justify-between items-center md:block">
          <div>
            <p className="text-green-100/70 uppercase text-[11px] tracking-[0.18em]">Sessao ativa</p>
            <p className="font-semibold truncate text-base mt-1">{user.name}</p>
            <p className="text-green-100/70 text-xs mt-1">{user.role === 'admin' ? 'Administrador' : 'Operador'}</p>
          </div>
          <button className="md:hidden text-white hover:text-red-300 p-1" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/os' && location.pathname.startsWith('/os/'));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[var(--brand-900)] font-semibold shadow-lg'
                    : 'text-green-50 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-[var(--brand-500)]/20' : 'bg-white/8'}`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{item.name}</p>
                    <p className={`text-xs truncate ${isActive ? 'text-[var(--brand-900)]/65' : 'text-green-100/65'}`}>{item.description}</p>
                  </div>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-2xl text-green-100 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-4 py-4 md:px-8 md:py-6 overflow-x-hidden overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="app-card rounded-[28px] min-h-full overflow-hidden">
          <div className="px-5 py-4 md:px-8 md:py-5 border-b border-[var(--border-soft)] bg-white/70 backdrop-blur-xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-600)]">Agrovogel Workspace</p>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--brand-900)]">
                  {currentItem?.name || 'Painel'}
                </h2>
              </div>
              <div className="text-sm text-[var(--text-600)]">
                {currentItem?.description || 'Gestao central da operacao'}
              </div>
            </div>
          </div>
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
