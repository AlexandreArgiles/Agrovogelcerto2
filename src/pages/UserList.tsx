import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, Shield, User as UserIcon, X, Mail, Edit, KeyRound } from 'lucide-react';

const emptyForm = { name: '', email: '', role: 'user' };

export const UserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { const res = await axios.get('/api/users'); setUsers(res.data); };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, formData);
        alert('Usuario atualizado com sucesso.');
      } else {
        await axios.post('/api/users', formData);
        alert('Usuario criado! Senha padrao: 123456');
      }
      closeModal();
      fetchUsers();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erro ao salvar usuario.');
    }
  };

  const handleResetPassword = async (user: any) => {
    const password = window.prompt(`Nova senha para ${user.name}:`, '123456');
    if (!password) return;

    try {
      await axios.post(`/api/users/${user.id}/reset-password`, { password });
      alert('Senha redefinida com sucesso. O usuario sera obrigado a trocar no proximo acesso.');
      fetchUsers();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erro ao redefinir a senha.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Equipe Interna</h1>
        <button onClick={openCreateModal} className="w-full sm:w-auto bg-[#8cc63f] text-[#0a5c36] font-bold px-4 py-2.5 rounded-lg flex items-center justify-center shadow-sm">
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
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800">{u.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 min-w-0">
                  <Mail size={14} />
                  <span className="truncate">{u.email}</span>
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className={`text-xs font-bold ${u.force_password_change ? 'text-orange-500' : 'text-green-500'}`}>
                {u.force_password_change ? 'Senha Pendente' : 'Senha Ativa'}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(u)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Editar usuario">
                  <Edit size={18}/>
                </button>
                <button onClick={() => handleResetPassword(u)} className="text-gray-400 hover:text-amber-600 transition-colors" title="Redefinir senha">
                  <KeyRound size={18}/>
                </button>
                <button onClick={async () => { if(confirm('Remover acesso deste usuario?')) { await axios.delete(`/api/users/${u.id}`); fetchUsers(); } }} className="text-gray-400 hover:text-red-500 transition-colors" title="Excluir usuario">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingUser ? 'Editar Usuario' : 'Cadastrar Novo Usuario'}</h2>
              <button type="button" onClick={closeModal}><X size={24}/></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
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
                {editingUser
                  ? 'Voce pode corrigir nome, e-mail e nivel de acesso aqui.'
                  : <>A senha inicial para novos usuarios sera <strong>123456</strong>. Eles serao obrigados a troca-la no primeiro acesso.</>}
              </p>
              <button className="w-full bg-[#0a5c36] text-white font-bold py-3 rounded-lg hover:bg-[#0d7a48] transition-colors">
                {editingUser ? 'Salvar Alteracoes' : 'Criar Acesso'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
