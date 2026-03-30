import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const ServiceList = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_type: 'fixed',
    price: '',
    technician_pay: ''
  });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try { 
      const res = await axios.get('/api/services'); 
      setServices(res.data); 
    } catch (error) { console.error('Falha ao buscar serviços', error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Converte vírgulas para pontos de forma segura antes de enviar
      const parsedPrice = parseFloat(String(formData.price).replace(',', '.')) || 0;
      const parsedTechPay = parseFloat(String(formData.technician_pay).replace(',', '.')) || 0;

      const payload = {
        ...formData,
        price: parsedPrice,
        technician_pay: parsedTechPay
      };

      if (editingService) {
        await axios.put(`/api/services/${editingService.id}`, payload);
      } else {
        await axios.post('/api/services', payload);
      }
      setIsModalOpen(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price_type: 'fixed', price: '', technician_pay: '' });
      fetchServices();
    } catch (error) { 
      alert('Erro ao guardar serviço'); 
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try { 
        await axios.delete(`/api/services/${id}`); 
        fetchServices(); 
      } catch (error) { alert('Erro ao excluir serviço'); }
    }
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price_type: service.price_type || 'fixed',
      price: service.price ? service.price.toString() : '',
      technician_pay: service.technician_pay ? service.technician_pay.toString() : ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Serviços</h1>
          <p className="text-gray-500 mt-1">Gerencie os tipos de serviços prestados e comissões</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', description: '', price_type: 'fixed', price: '', technician_pay: '' });
            setIsModalOpen(true);
          }}
          className="bg-[#8cc63f] text-[#0a5c36] font-bold px-5 py-2.5 rounded-lg hover:bg-[#7ab036] flex items-center space-x-2 transition-all shadow-sm"
        >
          <Plus size={20} strokeWidth={2.5} /> <span>Novo Serviço</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cobrança</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Valor Cliente (R$)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pag. Técnico (R$)</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{service.price_type === 'hourly' ? 'Por Hora' : 'Fixo'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  R$ {service.price?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  R$ {service.technician_pay?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-3">
                  <button onClick={() => openEditModal(service)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum serviço cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0a5c36] p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-green-100 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Serviço <span className="text-red-500">*</span></label>
                <input required type="text" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Cobrança</label>
                  <select className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.price_type} onChange={e => setFormData({...formData, price_type: e.target.value})}>
                    <option value="fixed">Preço Fixo (Por Serviço)</option>
                    <option value="hourly">Preço Por Hora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Valor p/ Cliente (R$)</label>
                  <input type="number" step="0.01" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Pagar Técnico (R$)</label>
                  <input type="number" step="0.01" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.technician_pay} onChange={e => setFormData({...formData, technician_pay: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-[#0a5c36] text-white font-bold rounded-lg hover:bg-[#0d7a48]">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};