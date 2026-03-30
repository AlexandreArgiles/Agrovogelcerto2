import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Check, X, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OSList = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    client_id: '', 
    service_id: '', 
    technician_ids: [] as number[],
    description: '', 
    latitude: '', 
    longitude: '', 
    image: null as File | null
  });

  useEffect(() => { 
    fetchOrders(); 
    fetchClients(); 
    fetchServices(); 
    fetchTechnicians();
  }, []);

  const fetchOrders = async () => { try { const res = await axios.get('/api/os'); setOrders(res.data); } catch (error) { console.error(error); } };
  const fetchClients = async () => { try { const res = await axios.get('/api/clients'); setClients(res.data); } catch (error) { console.error(error); } };
  const fetchServices = async () => { try { const res = await axios.get('/api/services'); setServices(res.data); } catch (error) { console.error(error); } };
  const fetchTechnicians = async () => { try { const res = await axios.get('/api/technicians'); setTechnicians(res.data); } catch (error) { console.error(error); } };

  const handleStatusChange = async (id: number, status: string) => {
    try { await axios.put(`/api/os/${id}/status`, { status }); fetchOrders(); } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço permanentemente?')) {
      try { await axios.delete(`/api/os/${id}`); fetchOrders(); } catch (error: any) { alert('Erro ao excluir a OS.'); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('client_id', formData.client_id);
    if(formData.service_id) data.append('service_id', formData.service_id);
    
    // Enviamos a lista de técnicos como JSON
    if(formData.technician_ids.length > 0) {
      data.append('technician_ids', JSON.stringify(formData.technician_ids));
    }
    
    data.append('description', formData.description);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    if (formData.image) data.append('image', formData.image);

    try {
      await axios.post('/api/os', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      setFormData({ client_id: '', service_id: '', technician_ids: [], description: '', latitude: '', longitude: '', image: null });
      fetchOrders();
    } catch (error: any) { alert('Erro ao criar Ordem de Serviço'); }
  };

  const translateStatus = (status: string) => {
    switch (status) { case 'pending': return 'Pendente'; case 'approved': return 'Aprovada'; case 'completed': return 'Concluída'; case 'refused': return 'Recusada'; default: return status; }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Ordens de Serviço</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Gerenciamento e acompanhamento de OS</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#8cc63f] text-[#0a5c36] font-bold px-5 py-2.5 rounded-lg hover:bg-[#7ab036] flex items-center justify-center space-x-2 transition-all shadow-sm">
          <Plus size={20} strokeWidth={2.5} /> <span>Nova OS</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Data</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{order.id}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">{order.client_name}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(order.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 inline-flex text-[10px] sm:text-xs leading-5 font-bold rounded-full 
                      ${order.status === 'approved' ? 'bg-green-100 text-[#0a5c36]' : 
                        order.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'refused' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {translateStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2 sm:space-x-3">
                    <button onClick={() => navigate(`/os/${order.id}`)} className="text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-2 sm:px-3 py-1.5 rounded-md font-semibold">
                      <Eye size={16} className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Abrir</span>
                    </button>
                    {order.status === 'pending' && (
                      <div className="flex space-x-1 sm:space-x-2">
                        <button onClick={() => handleStatusChange(order.id, 'approved')} className="text-[#0a5c36] bg-green-50 p-1.5 rounded-md" title="Aprovar"><Check size={18} strokeWidth={2.5} /></button>
                        <button onClick={() => handleStatusChange(order.id, 'refused')} className="text-red-500 bg-red-50 p-1.5 rounded-md" title="Recusar"><X size={18} strokeWidth={2.5} /></button>
                      </div>
                    )}
                    <button onClick={() => handleDelete(order.id)} className="text-gray-400 hover:text-red-600 ml-1 sm:ml-2 p-1.5" title="Excluir OS">
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-[#0a5c36] p-4 sm:p-5 flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Nova Ordem de Serviço</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-green-100 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente <span className="text-red-500">*</span></label>
                    <select required className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm p-2.5 border" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                      <option value="">Selecione</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Serviço Principal</label>
                    <select className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm p-2.5 border" value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})}>
                      <option value="">Selecione (Opcional)</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                
                {/* SELEÇÃO DE TÉCNICOS (NOVA) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Técnicos Responsáveis (Opcional)</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-300 max-h-32 overflow-y-auto">
                    {technicians.map(t => (
                      <label key={t.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-[#0a5c36]">
                        <input 
                          type="checkbox" 
                          className="rounded text-[#0a5c36] focus:ring-[#0a5c36]"
                          checked={formData.technician_ids.includes(t.id)}
                          onChange={(e) => {
                            const ids = e.target.checked 
                              ? [...formData.technician_ids, t.id]
                              : formData.technician_ids.filter(id => id !== t.id);
                            setFormData({...formData, technician_ids: ids});
                          }}
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    ))}
                    {technicians.length === 0 && <span className="text-xs text-gray-400">Nenhum técnico cadastrado.</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição do Problema <span className="text-red-500">*</span></label>
                  <textarea required className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm p-2.5 border resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 border sm:border-transparent border-gray-200">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-[#0a5c36] text-white font-bold rounded-lg hover:bg-[#0d7a48]">Salvar OS</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};