import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Save, User, Wrench, Image as ImageIcon, Edit, X, Navigation, DollarSign, Clock, Plus, CheckCircle, Trash2, Users, Car } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OSDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<any[]>([]);
  const [osTechnicians, setOsTechnicians] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [mileage, setMileage] = useState('');
  
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    service_id: '',
    extra_service_id: '',
    vehicle_id: '',
    technician_ids: [] as number[],
    hours_worked: '',
    description: '',
    latitude: '',
    longitude: '',
    status: '',
    image: null as File | null
  });

  useEffect(() => {
    fetchOSDetails();
    fetchServices();
    fetchAllTechnicians();
    fetchVehicles();
  }, [id]);

  const fetchOSDetails = async () => {
    try {
      const res = await axios.get(`/api/os/${id}`);
      setOs(res.data);
      setMileage(res.data.mileage?.toString() || '0');
      setManualLat(res.data.latitude?.toString() || '');
      setManualLng(res.data.longitude?.toString() || '');

      try {
        const techRes = await axios.get(`/api/os/${id}/technicians`);
        setOsTechnicians(Array.isArray(techRes.data) ? techRes.data : []);
      } catch (err) {
        setOsTechnicians([]);
      }
    } catch (error) {
      alert('Ordem de serviço não encontrada');
      navigate('/os');
    }
  };

  const fetchServices = async () => { try { const res = await axios.get('/api/services'); setServices(res.data); } catch (error) { console.error(error); } };
  const fetchAllTechnicians = async () => { try { const res = await axios.get('/api/technicians'); setAllTechnicians(res.data); } catch (error) { console.error(error); } };
  const fetchVehicles = async () => { try { const res = await axios.get('/api/vehicles'); setVehicles(res.data); } catch (error) { console.error(error); } };

const handleSaveMileage = async () => {
    setIsSaving(true);
    try {
      let newTravelCost = 0;
      if (os.vehicle_id) {
        const vehicle = vehicles.find(v => v.id === os.vehicle_id);
        if (vehicle && Number(mileage) > 0) {
          // Mantendo a consistência: KM * 2 para ida e volta
          newTravelCost = ((Number(mileage) * 2) / vehicle.consumption) * vehicle.fuel_price;
        }
      }

      const data = new FormData();
      data.append('client_id', os.client_id.toString());
      data.append('description', os.description);
      data.append('status', os.status);
      data.append('mileage', mileage);
      data.append('travel_cost', newTravelCost.toString());
      
      await axios.put(`/api/os/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Quilometragem e custo de deslocação (Ida/Volta) atualizados!');
      fetchOSDetails();
    } catch (error) { alert('Erro ao atualizar quilometragem'); } finally { setIsSaving(false); }
  };
  const handleSaveManualLocation = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('client_id', os.client_id.toString());
      data.append('description', os.description);
      data.append('status', os.status);
      data.append('latitude', manualLat);
      data.append('longitude', manualLng);
      data.append('mileage', os.mileage?.toString() || '0');
      data.append('travel_cost', os.travel_cost?.toString() || '0');
      
      await axios.put(`/api/os/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Localização manual salva com sucesso!');
      fetchOSDetails();
    } catch (error: any) { alert('Erro ao salvar a localização manualmente.'); } finally { setIsSaving(false); }
  };

  const handleUpdateLocationDirectly = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = new FormData();
            data.append('client_id', os.client_id.toString());
            data.append('description', os.description);
            data.append('status', os.status);
            data.append('latitude', position.coords.latitude.toString());
            data.append('longitude', position.coords.longitude.toString());
            data.append('mileage', os.mileage?.toString() || '0');
            data.append('travel_cost', os.travel_cost?.toString() || '0');

            await axios.put(`/api/os/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Localização GPS atualizada com sucesso!');
            fetchOSDetails();
          } catch (error: any) { alert('Erro ao salvar a nova localização.'); }
        },
        (error) => { alert('Erro ao obter localização: ' + error.message); }
      );
    } else { alert('Geolocalização não é suportada por este navegador.'); }
  };

  const initEditForm = (targetStatus: string) => {
    setEditFormData({
      service_id: os.service_id?.toString() || '',
      extra_service_id: os.extra_service_id?.toString() || '',
      vehicle_id: os.vehicle_id?.toString() || '',
      technician_ids: osTechnicians.map(t => t.id),
      hours_worked: os.hours_worked?.toString() || '',
      description: os.description || '',
      latitude: os.latitude?.toString() || '',
      longitude: os.longitude?.toString() || '',
      status: targetStatus,
      image: null
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteOS = async () => {
    if (window.confirm('Tem certeza absoluta que deseja excluir esta Ordem de Serviço? Todo o histórico dela será apagado.')) {
      try { await axios.delete(`/api/os/${id}`); alert('OS excluída com sucesso.'); navigate('/os'); } catch (error: any) { alert(error.response?.data?.message || 'Erro ao excluir a OS.'); }
    }
  };

const calculateTotals = () => {
    const baseService = services.find(s => s.id === Number(editFormData.service_id));
    const extraService = services.find(s => s.id === Number(editFormData.extra_service_id));
    const vehicle = vehicles.find(v => v.id === Number(editFormData.vehicle_id));
    const hours = Number(editFormData.hours_worked) || 0;

    let calcPrice = 0;
    let calcTech = 0;
    let calcTravelCost = 0;

    if (baseService) {
      calcPrice += baseService.price_type === 'hourly' ? baseService.price * hours : baseService.price;
      calcTech += baseService.price_type === 'hourly' ? baseService.technician_pay * hours : baseService.technician_pay;
    }
    if (extraService) {
      calcPrice += extraService.price_type === 'hourly' ? extraService.price * hours : extraService.price;
      calcTech += extraService.price_type === 'hourly' ? extraService.technician_pay * hours : extraService.technician_pay;
    }

    // CÁLCULO ATUALIZADO: (KM * 2) / Consumo * Preço do Litro
    if (vehicle && Number(mileage) > 0) {
      // Multiplicamos por 2 para considerar IDA e VOLTA automaticamente
      calcTravelCost = ((Number(mileage) * 2) / vehicle.consumption) * vehicle.fuel_price;
    }

    return { price: calcPrice, techPay: calcTech, travelCost: calcTravelCost };
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    const data = new FormData();
    
    data.append('client_id', os.client_id.toString());
    data.append('service_id', editFormData.service_id || '');
    data.append('extra_service_id', editFormData.extra_service_id || '');
    data.append('vehicle_id', editFormData.vehicle_id || '');
    data.append('technician_ids', JSON.stringify(editFormData.technician_ids));
    data.append('description', editFormData.description);
    data.append('status', editFormData.status);
    data.append('latitude', editFormData.latitude);
    data.append('longitude', editFormData.longitude);
    data.append('mileage', mileage); 
    data.append('hours_worked', editFormData.hours_worked || '0');
    data.append('travel_cost', totals.travelCost.toString());
    data.append('final_price', totals.price.toString());
    data.append('final_technician_pay', totals.techPay.toString());
    if (editFormData.image) data.append('image', editFormData.image);

    try {
      await axios.put(`/api/os/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditModalOpen(false);
      fetchOSDetails();
      alert('OS atualizada com sucesso!');
    } catch (error: any) { alert(error.response?.data?.message || 'Erro ao atualizar a Ordem de Serviço.'); }
  };

  if (!os) return <div className="p-8 text-center text-gray-500">Carregando detalhes...</div>;

  const mapLink = `http://googleusercontent.com/maps.google.com/maps?q=${os.latitude},${os.longitude}`;
  const totals = calculateTotals();

  const translateStatus = (status: string) => {
    switch (status) { case 'pending': return 'Pendente'; case 'approved': return 'Aprovada'; case 'completed': return 'Concluída'; case 'refused': return 'Recusada'; default: return status; }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate('/os')} className="flex items-center text-gray-500 hover:text-[#0a5c36] font-semibold mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Voltar para lista
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0a5c36] p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Ordem de Serviço #{os.id}</h1>
            <p className="text-green-100 mt-1 opacity-90 text-sm">{format(new Date(os.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wide shadow-sm ${os.status === 'completed' ? 'bg-blue-600 text-white' : os.status === 'refused' ? 'bg-red-100 text-red-800' : 'bg-white text-[#0a5c36]'}`}>
              {translateStatus(os.status)}
            </span>
            
            {os.status !== 'completed' && (
              <button onClick={() => initEditForm('completed')} className="bg-white text-[#0a5c36] hover:bg-green-50 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-sm flex items-center text-sm active:scale-95">
                <CheckCircle size={16} className="mr-1.5" /> Concluir OS
              </button>
            )}

            <button onClick={() => initEditForm(os.status || 'pending')} className="bg-[#8cc63f] hover:bg-[#7ab036] text-[#0a5c36] p-2 sm:p-2.5 rounded-full transition-all shadow-sm active:scale-95" title="Editar OS">
              <Edit size={18} strokeWidth={2.5} />
            </button>
            
            <button onClick={handleDeleteOS} className="bg-red-500 hover:bg-red-600 text-white p-2 sm:p-2.5 rounded-full transition-all shadow-sm active:scale-95" title="Excluir OS">
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><User size={16} className="mr-2"/> Cliente</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-800">{os.client_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><Users size={16} className="mr-2"/> Técnicos</h3>
                <div className="flex flex-wrap gap-2">
                  {osTechnicians.length > 0 ? osTechnicians.map(t => (
                    <span key={t.id} className="bg-green-100 text-[#0a5c36] px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">{t.name}</span>
                  )) : <p className="text-gray-400 text-sm italic">Nenhum</p>}
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><Car size={16} className="mr-2"/> Veículo da Frota</h3>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{os.vehicle_name || <span className="text-gray-400 italic font-normal">Não vinculado</span>}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center"><Wrench size={14} className="mr-1.5"/> Serviço Base</h3>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{os.service_name || 'Não vinculado'}</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center"><Plus size={14} className="mr-1.5"/> Serviço Extra</h3>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{os.extra_service_name || 'Nenhum'}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 sm:p-5 rounded-xl border border-green-100">
              <h3 className="text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center">
                <DollarSign size={16} className="mr-2"/> Resumo Financeiro
              </h3>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase">Horas</p>
                  <p className="text-base font-bold text-green-900 flex items-center"><Clock size={14} className="mr-1"/> {os.hours_worked || 0}h</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase">Cliente Paga</p>
                  <p className="text-base font-bold text-green-900">R$ {(os.final_price || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase">Técnicos</p>
                  <p className="text-base font-bold text-blue-700">R$ {(os.final_technician_pay || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-red-600 font-bold uppercase">Combustível</p>
                  <p className="text-base font-bold text-red-600">R$ {(os.travel_cost || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição do Problema / Serviço</h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[80px] text-sm whitespace-pre-wrap">
                {os.description}
              </div>
            </div>
            
            {os.image_url && (
              <div>
                 <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><ImageIcon size={16} className="mr-2"/> Anexo</h3>
                 <a href={os.image_url} target="_blank" rel="noopener noreferrer"><img src={os.image_url} alt="Anexo OS" className="max-w-full sm:max-w-[200px] rounded-lg shadow-sm border hover:opacity-90 transition-opacity" /></a>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 sm:p-5 rounded-xl border border-blue-100">
              <h3 className="text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center">
                <MapPin size={16} className="mr-2"/> Localização
              </h3>
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Latitude</label>
                    <input type="number" step="any" className="w-full rounded-lg border-gray-300 shadow-sm p-2 text-xs sm:text-sm" value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="-30.1234" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Longitude</label>
                    <input type="number" step="any" className="w-full rounded-lg border-gray-300 shadow-sm p-2 text-xs sm:text-sm" value={manualLng} onChange={e => setManualLng(e.target.value)} placeholder="-54.1234" />
                  </div>
                </div>
                <button onClick={handleSaveManualLocation} disabled={isSaving} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center text-sm">
                  <Save size={16} className="mr-2" /> Salvar Coordenadas
                </button>
                <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-blue-200"></div>
                    <span className="flex-shrink-0 mx-4 text-blue-400 text-[10px] font-bold uppercase">Ou Automático</span>
                    <div className="flex-grow border-t border-blue-200"></div>
                </div>
                <button onClick={handleUpdateLocationDirectly} className="flex items-center justify-center w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-lg shadow-sm text-sm">
                  <Navigation size={16} className="mr-2" /> Puxar pelo GPS Agora
                </button>
                {os.latitude && os.longitude && (
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg shadow-sm mt-2 flex justify-center items-center text-sm">
                    <MapPin size={16} className="mr-2"/> Abrir no Google Maps
                  </a>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
              <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Quilometragem Ida e Volta (KM)</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" step="0.1" className="flex-1 rounded-lg border-gray-300 shadow-sm p-2.5 border text-sm" value={mileage} onChange={(e) => setMileage(e.target.value)} />
                <button onClick={handleSaveMileage} disabled={isSaving} className="bg-[#0a5c36] text-white px-4 py-2.5 rounded-lg font-bold hover:bg-[#0d7a48] flex items-center justify-center text-sm">
                  <Save size={16} className={isSaving ? "opacity-50" : "mr-2"} /> {isSaving ? 'Salvando...' : 'Salvar KMs'}
                </button>
              </div>
              {os.vehicle_id && <p className="text-xs text-gray-500 mt-2 italic">* O custo do combustível será atualizado automaticamente ao salvar.</p>}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
            <div className="bg-[#0a5c36] p-4 sm:p-5 flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Editar / Concluir OS</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-green-100 hover:text-white p-1"><X size={24} /></button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select className={`block w-full rounded-lg shadow-sm p-2.5 border transition-colors ${editFormData.status === 'completed' ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-gray-50 border-gray-300'}`} value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})}>
                      <option value="pending">Pendente</option>
                      <option value="approved">Aprovada</option>
                      <option value="completed">Concluída</option>
                      <option value="refused">Recusada</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Serviço Base</label>
                    <select className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={editFormData.service_id} onChange={e => setEditFormData({...editFormData, service_id: e.target.value})}>
                      <option value="">Nenhum</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Serviço Extra</label>
                    <select className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={editFormData.extra_service_id} onChange={e => setEditFormData({...editFormData, extra_service_id: e.target.value})}>
                      <option value="">Nenhum</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Veículo Utilizado</label>
                    <select className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border" value={editFormData.vehicle_id} onChange={e => setEditFormData({...editFormData, vehicle_id: e.target.value})}>
                      <option value="">Nenhum</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Técnicos (Opcional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-300 max-h-32 overflow-y-auto">
                    {allTechnicians.map(t => (
                      <label key={t.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-[#0a5c36]">
                        <input type="checkbox" className="rounded text-[#0a5c36] focus:ring-[#0a5c36]" checked={editFormData.technician_ids.includes(t.id)} onChange={(e) => {
                            const ids = e.target.checked ? [...editFormData.technician_ids, t.id] : editFormData.technician_ids.filter(id => id !== t.id);
                            setEditFormData({...editFormData, technician_ids: ids});
                        }} />
                        <span className="truncate">{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-sm font-bold text-blue-900 mb-1">Horas Trabalhadas (Se aplicável)</label>
                    <input type="number" step="0.5" min="0" className="block w-full rounded-lg border-blue-300 bg-white p-2.5 border" value={editFormData.hours_worked} onChange={e => setEditFormData({...editFormData, hours_worked: e.target.value})} placeholder="Ex: 2.5" />
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase mb-1">Cálculo Automático</p>
                    <p className="text-base sm:text-lg font-bold text-blue-900">Cliente: R$ {totals.price.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm font-bold text-green-700">Técnico(s): R$ {totals.techPay.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm font-bold text-red-600">Combustível: R$ {totals.travelCost.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição / Relatório <span className="text-red-500">*</span></label>
                  <textarea required className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 border resize-none" rows={3} value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 mt-2 border-t border-gray-100 pt-4 gap-3 sm:gap-0">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 border sm:border-transparent border-gray-200">Cancelar</button>
                  <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-[#0a5c36] text-white font-bold rounded-lg hover:bg-[#0d7a48]">Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};