import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { KeyRound, X } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(email);
    setTempPassword('');
    setForgotMessage('');
    setIsForgotModalOpen(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setTempPassword('');
    setForgotMessage('');

    try {
      const response = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setTempPassword(response.data.tempPassword);
      setForgotMessage(`Senha temporaria gerada para ${response.data.userName}.`);
    } catch (err: any) {
      setForgotMessage(err.response?.data?.message || 'Nao foi possivel redefinir a senha.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a5c36] to-[#0d7a48] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#8cc63f] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[400px] z-10 relative">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden relative border-4 border-gray-50">
            <img src="/agrovogel-logo.png" alt="AgroVogel" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-bold tracking-wider text-[#0a5c36]">AGRO<span className="font-light">VOGEL</span></h2>
          <p className="text-sm text-[#8cc63f] font-medium tracking-widest mt-1">SOLUCOES INTELIGENTES</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-3 border transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-3 border transition-colors"
              placeholder="********"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={openForgotPassword}
              className="text-sm font-semibold text-[#0a5c36] hover:text-[#8cc63f] inline-flex items-center gap-2"
            >
              <KeyRound size={16} />
              Esqueci a senha
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#8cc63f] text-[#0a5c36] font-bold p-3 rounded-lg hover:bg-[#7ab036] transition-all transform active:scale-95 shadow-md flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0a5c36]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Entrar no Sistema'}
          </button>
        </form>
      </div>

      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleForgotPassword} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Esqueci a Senha</h2>
              <button type="button" onClick={() => setIsForgotModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Informe o e-mail do usuario para gerar uma senha temporaria. Depois do login, a troca de senha sera obrigatoria.
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-3 border transition-colors"
                  placeholder="usuario@empresa.com"
                />
              </div>

              {forgotMessage && (
                <div className={`rounded-xl p-3 text-sm ${tempPassword ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                  <p>{forgotMessage}</p>
                  {tempPassword && <p className="mt-2 font-bold">Senha temporaria: {tempPassword}</p>}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={() => setIsForgotModalOpen(false)} className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100">
                  Fechar
                </button>
                <button type="submit" disabled={isForgotLoading} className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0a5c36] text-white font-bold hover:bg-[#0d7a48]">
                  {isForgotLoading ? 'Gerando...' : 'Gerar senha temporaria'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
