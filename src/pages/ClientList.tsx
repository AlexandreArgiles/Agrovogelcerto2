import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  birth_date: '',
  latitude: '',
  longitude: ''
};

export const ClientList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [formData, setFormData] = useState(emptyForm);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData(emptyForm);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      cpf: client.cpf || '',
      birth_date: client.birth_date || '',
      latitude: client.latitude?.toString() || '',
      longitude: client.longitude?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put(`/api/clients/${editingClient.id}`, formData);
      } else {
        await axios.post('/api/clients', formData);
      }
      closeModal();
      fetchClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Falha ao salvar cliente');
    }
  };

  const handleDelete = async (client: any) => {
    if (!window.confirm(`Deseja excluir o cliente ${client.name}?`)) return;
    try {
      await axios.delete(`/api/clients/${client.id}`);
      fetchClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Falha ao excluir cliente');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerenciamento de base de clientes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-[#8cc63f] text-[#0a5c36] font-bold px-5 py-2.5 rounded-lg hover:bg-[#7ab036] flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="table-scroll">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nascimento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acoes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{client.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.cpf || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.birth_date || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button onClick={() => openEditModal(client)} className="text-blue-500 hover:text-blue-700">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(client)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0a5c36] p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h2>
              <button
                onClick={closeModal}
                className="text-green-100 hover:text-white transition-colors rounded-full p-1 hover:bg-[#0d7a48]"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                  placeholder="Ex: Joao da Silva"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-[#8cc63f] focus:ring-[#8cc63f] focus:bg-white p-2.5 border transition-colors"
                    value={formData.birth_date}
                    onChange={e => setFormData({...formData, birth_date: e.target.value})}
                  />
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          setFormData((current) => ({
                            ...current,
                            latitude: position.coords.latitude.toString(),
                            longitude: position.coords.longitude.toString()
                          }));
                        },
                        (error) => {
                          alert('Erro ao obter localizacao: ' + error.message);
                        }
                      );
                    } else {
                      alert('Geolocalizacao nao e suportada por este navegador.');
                    }
                  }}
                  className="w-full sm:w-auto text-sm text-[#0a5c36] font-semibold hover:text-[#8cc63f] transition-colors inline-flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capturar Localizacao Atual
                </button>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0a5c36] text-white font-bold rounded-lg hover:bg-[#0d7a48] transition-colors shadow-sm"
                >
                  {editingClient ? 'Salvar Alteracoes' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
