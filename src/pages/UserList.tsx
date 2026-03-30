import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, Shield, User as UserIcon, X, Mail } from 'lucide-react';

export const UserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { const res = await axios.get('/api/users'); setUsers(res.data); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: 'user' });
      fetchUsers();
      alert('Usuario criado! Senha padrao: 123456');
    } catch (error) { alert('Erro ao criar usuario.'); }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Equipe Interna</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#8cc63f] text-[#0a5c36] font-bold px-4 py-2.5 rounded-lg flex items-center shadow-sm">
          <UserPlus size={20} className="mr-2"/> Novo Acesso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-1 px-3 text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
              {u.role}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-50 p-3 rounded-full text-[#0a5c36]">
                {u.role === 'admin' ? <Shield size={24}/> : <UserIcon size={24}/>}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{u.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail size={14} />
                  <span>{u.email}</span>
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className={`text-xs font-bold ${u.force_password_change ? 'text-orange-500' : 'text-green-500'}`}>
                {u.force_password_change ? 'Senha Pendente' : 'Senha Ativa'}
              </span>
              <button onClick={async () => { if(confirm('Remover acesso deste usuario?')) { await axios.delete(`/api/users/${u.id}`); fetchUsers(); } }} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Cadastrar Novo Usuario</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input required className="w-full border p-2.5 rounded-lg bg-gray-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Alexandre Argiles" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail de Login</label>
                <input required type="email" className="w-full border p-2.5 rounded-lg bg-gray-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Ex: alexandre@agrovogel.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel de Acesso</label>
                <select className="w-full border p-2.5 rounded-lg bg-gray-50" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="user">Usuario Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
                * A senha inicial para todos os novos usuarios sera <strong>123456</strong>. Eles serao obrigados a troca-la no primeiro acesso.
              </p>
              <button className="w-full bg-[#0a5c36] text-white font-bold py-3 rounded-lg hover:bg-[#0d7a48] transition-colors">Criar Acesso</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
