import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Phone, Mail } from 'lucide-react';

export const TechnicianList = () => {
  const [techs, setTechs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => { fetchTechs(); }, []);
  const fetchTechs = async () => { const res = await axios.get('/api/technicians'); setTechs(res.data); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTech) await axios.put(`/api/technicians/${editingTech.id}`, formData);
    else await axios.post('/api/technicians', formData);
    setIsModalOpen(false);
    fetchTechs();
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Gestão de Técnicos</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Registe os profissionais e veja o saldo de cada um</p>
        </div>
        <button onClick={() => { setEditingTech(null); setFormData({name:'', phone:'', email:''}); setIsModalOpen(true); }} className="bg-[#8cc63f] text-[#0a5c36] font-bold px-4 py-2.5 rounded-lg flex items-center shadow-sm">
          <Plus size={20} className="mr-2"/> <span className="hidden sm:inline">Novo Técnico</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techs.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#0a5c36] mb-4">{t.name}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="flex items-center"><Phone size={16} className="mr-2 text-gray-400"/> {t.phone || 'Sem telefone'}</p>
                <p className="flex items-center"><Mail size={16} className="mr-2 text-gray-400"/> {t.email || 'Sem e-mail'}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Saldo a Pagar</p>
                <p className="text-xl font-black text-blue-600">R$ {(t.total_earned || 0).toFixed(2)}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => { setEditingTech(t); setFormData({name:t.name, phone:t.phone, email:t.email}); setIsModalOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                <button onClick={async () => { if(window.confirm('Excluir técnico?')) { await axios.delete(`/api/technicians/${t.id}`); fetchTechs(); } }} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingTech ? 'Editar Técnico' : 'Cadastro de Técnico'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="hover:text-green-200"><X size={24}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                <input placeholder="Ex: João Silva" required className="w-full border border-gray-300 bg-gray-50 p-2.5 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                <input placeholder="(00) 00000-0000" className="w-full border border-gray-300 bg-gray-50 p-2.5 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input placeholder="tecnico@agrovogel.com" type="email" className="w-full border border-gray-300 bg-gray-50 p-2.5 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-lg transition-colors">Salvar Técnico</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};