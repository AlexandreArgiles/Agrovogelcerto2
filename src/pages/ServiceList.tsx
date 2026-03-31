import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const emptyForm = {
  name: '',
  description: '',
  price_type: 'fixed',
  price: '',
  technician_pay: '',
  billing_party: 'client',
  payer_name: ''
};

export const ServiceList = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (error) {
      console.error('Falha ao buscar servicos', error);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsedPrice = parseFloat(String(formData.price).replace(',', '.')) || 0;
      const parsedTechPay = parseFloat(String(formData.technician_pay).replace(',', '.')) || 0;

      const payload = {
        ...formData,
        price: parsedPrice,
        technician_pay: parsedTechPay,
        payer_name: formData.billing_party === 'partner' ? formData.payer_name : ''
      };

      if (editingService) {
        await axios.put(`/api/services/${editingService.id}`, payload);
      } else {
        await axios.post('/api/services', payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      alert('Erro ao salvar servico');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este servico?')) return;

    try {
      await axios.delete(`/api/services/${id}`);
      fetchServices();
    } catch (error) {
      alert('Erro ao excluir servico');
    }
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price_type: service.price_type || 'fixed',
      price: service.price ? service.price.toString() : '',
      technician_pay: service.technician_pay ? service.technician_pay.toString() : '',
      billing_party: service.billing_party || 'client',
      payer_name: service.payer_name || ''
    });
    setIsModalOpen(true);
  };

  const describeBillingParty = (service: any) => {
    if (service.billing_party === 'partner') {
      return service.payer_name ? `Empresa parceira: ${service.payer_name}` : 'Empresa parceira';
    }
    return 'Cliente final';
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Servicos</h1>
          <p className="text-gray-500 mt-1">Gerencie os tipos de servico, quem paga e o repasse para os tecnicos.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#8cc63f] text-[#0a5c36] font-bold px-5 py-2.5 rounded-lg hover:bg-[#7ab036] flex items-center space-x-2 transition-all shadow-sm"
        >
          <Plus size={20} strokeWidth={2.5} /> <span>Novo Servico</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="table-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cobranca</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Quem paga</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Valor do servico</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pag. tecnico</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <p className="font-bold text-[#0a5c36]">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description || 'Sem descricao'}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                    {service.price_type === 'hourly' ? 'Por hora' : 'Fixo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${service.billing_party === 'partner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-[#0a5c36]'}`}>
                    {describeBillingParty(service)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  R$ {Number(service.price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  R$ {Number(service.technician_pay || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-3">
                  <button onClick={() => openEditModal(service)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum servico cadastrado.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#0a5c36] p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingService ? 'Editar Servico' : 'Novo Servico'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-green-100 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do servico <span className="text-red-500">*</span></label>
                <input required type="text" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descricao</label>
                <textarea className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border resize-none" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de cobranca</label>
                  <select className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.price_type} onChange={e => setFormData({ ...formData, price_type: e.target.value })}>
                    <option value="fixed">Preco fixo</option>
                    <option value="hourly">Preco por hora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quem paga</label>
                  <select
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border"
                    value={formData.billing_party}
                    onChange={e => setFormData({ ...formData, billing_party: e.target.value, payer_name: e.target.value === 'partner' ? formData.payer_name : '' })}
                  >
                    <option value="client">Cliente final</option>
                    <option value="partner">Empresa parceira</option>
                  </select>
                </div>
              </div>

              {formData.billing_party === 'partner' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Empresa pagadora</label>
                  <input
                    type="text"
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border"
                    placeholder="Ex: HughesNet"
                    value={formData.payer_name}
                    onChange={e => setFormData({ ...formData, payer_name: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Valor do servico (R$)</label>
                  <input type="number" step="0.01" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Pagar tecnico (R$)</label>
                  <input type="number" step="0.01" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={formData.technician_pay} onChange={e => setFormData({ ...formData, technician_pay: e.target.value })} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                {formData.billing_party === 'partner'
                  ? 'Esse servico nao sera tratado como cobranca do cliente final. Ele continua entrando no faturamento, mas fica marcado como pago por empresa parceira.'
                  : 'Esse servico entra normalmente como valor cobrado do cliente final.'}
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
