import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, List, LogOut, Home, Users, Package, Wrench, Menu, X, DollarSign, Car, Shield } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado do menu mobile

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Outlet />;
  }

  const navItems = [
    { path: '/', name: 'Painel de Controle', icon: Home },
    { path: '/os', name: 'Ordens de Serviço', icon: List },
    { path: '/finance', name: 'Financeiro', icon: DollarSign },
    { path: '/clients', name: 'Clientes', icon: Users },
    { path: '/services', name: 'Serviços', icon: Wrench },
    { path: '/map', name: 'Mapa', icon: Map },
    { path: '/vehicles', name: 'Frota & Veículos', icon: Car },
    { path: '/technicians', name: 'Técnicos', icon: Wrench },
    { path: '/users', name: 'Usuários', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* CABEÇALHO MOBILE (Visível apenas em ecrãs pequenos) */}
      <div className="md:hidden bg-[#0a5c36] text-white p-4 flex justify-between items-center shadow-md z-40 relative">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#8cc63f] rounded-t-full"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white rounded-b-full"></div>
            <svg viewBox="0 0 100 100" className="w-6 h-6 z-10 drop-shadow-sm">
              <path d="M10,50 Q30,20 90,10 Q70,80 10,50 Z" fill="#8cc63f" />
              <path d="M90,50 Q70,80 10,90 Q30,20 90,50 Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-wider">AGRO<span className="font-light">VOGEL</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-green-200 focus:outline-none">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* OVERLAY ESCURO (Fundo transparente quando menu abre no mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* BARRA LATERAL (Sidebar) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a5c36] text-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* LOGO (Escondida no mobile porque já está no topo) */}
        <div className="p-6 border-b border-[#0d7a48] hidden md:flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#8cc63f] rounded-t-full"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white rounded-b-full"></div>
            <svg viewBox="0 0 100 100" className="w-12 h-12 z-10 drop-shadow-sm">
              <path d="M10,50 Q30,20 90,10 Q70,80 10,50 Z" fill="#8cc63f" />
              <path d="M90,50 Q70,80 10,90 Q30,20 90,50 Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-wider">AGRO<span className="font-light">VOGEL</span></h1>
          <p className="text-xs text-[#8cc63f] font-medium tracking-widest mt-1">SOLUÇÕES INTELIGENTES</p>
        </div>
        
        {/* PERFIL DO USUÁRIO */}
        <div className="px-4 py-4 bg-[#084a2b] text-sm flex justify-between items-center md:block">
          <div>
            <p className="text-green-100 opacity-80">Bem-vindo,</p>
            <p className="font-semibold truncate">{user.name}</p>
          </div>
          {/* Botão fechar extra no mobile */}
          <button className="md:hidden text-white hover:text-red-400 p-1" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        {/* MENU NAVEGAÇÃO */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/os' && location.pathname.startsWith('/os/'));
            
            return (
              <Link 
                key={item.path}
                to={item.path} 
                onClick={() => setIsMobileMenuOpen(false)} // Fecha o menu no mobile ao clicar
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#8cc63f] text-[#0a5c36] font-semibold shadow-md' 
                    : 'text-green-50 hover:bg-[#0d7a48] hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* SAIR */}
        <div className="p-4 border-t border-[#0d7a48]">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-green-100 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (Main Content) */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto bg-gray-50 h-[calc(100vh-64px)] md:h-screen w-full">
        <Outlet />
      </main>
    </div>
  );
};