import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('As novas senhas não coincidem.');
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/change-password', { oldPassword, newPassword });
      if (user && response.data.token) {
        login(response.data.token, { ...user, force_password_change: false });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao alterar a senha. Verifique sua senha atual.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a5c36] to-[#0d7a48] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#8cc63f] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[450px] z-10 relative">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-md overflow-hidden relative border-2 border-gray-50">
            <img src="/agrovogel-logo.png" alt="AgroVogel" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-[#0a5c36]">AGRO<span className="font-light">VOGEL</span></h2>
        </div>

        <h3 className="text-xl font-bold mb-2 text-center text-gray-800">Atualização de Senha</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">Por motivos de segurança, é necessário alterar sua senha no primeiro acesso.</p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha Atual</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-3 border transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-3 border transition-colors"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-3 border transition-colors"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#8cc63f] text-[#0a5c36] font-bold p-3 rounded-lg hover:bg-[#7ab036] transition-all transform active:scale-95 shadow-md flex justify-center items-center mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a5c36]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};
