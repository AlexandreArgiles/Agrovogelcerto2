import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

export const ClientList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get('/api/clients');
      setClients(res.data);
    } catch (error) {
      console.error('Falha ao buscar clientes', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/clients', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', latitude: '', longitude: '' });
      fetchClients();
    } catch (error) {
      console.error('Falha ao salvar cliente', error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerenciamento de base de clientes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#8cc63f] text-[#0a5c36] font-bold px-5 py-2.5 rounded-lg hover:bg-[#7ab036] flex items-center space-x-2 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{client.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0a5c36] p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Cadastrar Novo Cliente</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-green-100 hover:text-white transition-colors rounded-full p-1 hover:bg-[#0d7a48]"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input 
                  type="email"
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                  placeholder="joao@exemplo.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                <input 
                  type="text"
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                  <input 
                    type="number" step="any"
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                    placeholder="-23.5505"
                    value={formData.latitude}
                    onChange={e => setFormData({...formData, latitude: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                  <input 
                    type="number" step="any"
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                    placeholder="-46.6333"
                    value={formData.longitude}
                    onChange={e => setFormData({...formData, longitude: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setFormData({
                            ...formData,
                            latitude: position.coords.latitude.toString(),
                            longitude: position.coords.longitude.toString()
                          });
                        },
                        (error) => {
                          alert('Erro ao obter localização: ' + error.message);
                        }
                      );
                    } else {
                      alert('Geolocalização não é suportada por este navegador.');
                    }
                  }}
                  className="text-sm text-[#0a5c36] font-semibold hover:text-[#8cc63f] transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capturar Localização Atual
                </button>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#0a5c36] text-white font-bold rounded-lg hover:bg-[#0d7a48] transition-colors shadow-sm"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
