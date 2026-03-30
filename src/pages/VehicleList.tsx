import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, X, Wrench, Settings, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export const VehicleList = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isVehModalOpen, setIsVehModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [vehData, setVehData] = useState({ id: '', name: '', plate: '', consumption: '', fuel_price: '' });
  const [expData, setExpData] = useState({ vehicle_id: '', description: '', amount: '' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    const [vRes, eRes] = await Promise.all([axios.get('/api/vehicles'), axios.get('/api/vehicles/expenses')]);
    setVehicles(vRes.data); setExpenses(eRes.data);
  };

  const saveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if(vehData.id) await axios.put(`/api/vehicles/${vehData.id}`, vehData);
    else await axios.post('/api/vehicles', vehData);
    setIsVehModalOpen(false); fetchData();
  };

  const saveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/vehicles/expenses', expData);
    setIsExpModalOpen(false); fetchData();
  };

  return (
    <div className="animate-in fade-in max-w-full">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold text-[#0a5c36]">Frota & Manutenção</h1></div>
        <div className="flex space-x-2">
          <button onClick={() => { setExpData({vehicle_id:'', description:'', amount:''}); setIsExpModalOpen(true); }} className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-lg flex items-center"><DollarSign size={18} className="mr-1"/> Add Despesa</button>
          <button onClick={() => { setVehData({id:'', name:'', plate:'', consumption:'', fuel_price:''}); setIsVehModalOpen(true); }} className="bg-[#8cc63f] text-[#0a5c36] font-bold px-4 py-2 rounded-lg flex items-center"><Plus size={18} className="mr-1"/> Novo Veículo</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#0a5c36]">{v.name}</h3>
              <p className="text-sm font-semibold text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded mt-1">{v.plate}</p>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>Consumo Médio: <strong className="text-gray-800">{v.consumption} km/L</strong></p>
                <p>Custo Litro (Combustível): <strong className="text-gray-800">R$ {v.fuel_price?.toFixed(2)}</strong></p>
                <p>Custo por KM Rodado: <strong className="text-green-600">R$ {(v.fuel_price / v.consumption).toFixed(2)} / km</strong></p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
              <button onClick={() => { setVehData(v); setIsVehModalOpen(true); }} className="text-blue-500"><Edit size={18}/></button>
              <button onClick={async () => { if(confirm('Excluir?')) { await axios.delete(`/api/vehicles/${v.id}`); fetchData(); } }} className="text-red-500"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center"><Wrench className="mr-2 text-gray-400" size={20}/> Histórico de Manutenções e Gastos</h3>
        {expenses.map(e => (
          <div key={e.id} className="flex justify-between items-center py-3 border-b last:border-0">
            <div>
              <p className="font-bold text-sm">{e.description}</p>
              <p className="text-xs text-gray-500">{e.vehicle_name} • {format(new Date(e.created_at), 'dd/MM/yyyy')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-bold text-red-600">- R$ {e.amount.toFixed(2)}</span>
              <button onClick={async () => { await axios.delete(`/api/vehicles/expenses/${e.id}`); fetchData(); }} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Veiculo (simplificado) */}
      {isVehModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={saveVehicle} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg mb-4">Dados do Veículo</h2>
            <input required placeholder="Nome (Ex: Fiat Uno)" className="w-full border p-2 rounded" value={vehData.name} onChange={e => setVehData({...vehData, name: e.target.value})} />
            <input required placeholder="Placa" className="w-full border p-2 rounded" value={vehData.plate} onChange={e => setVehData({...vehData, plate: e.target.value})} />
            <input required type="number" step="0.1" placeholder="Consumo (km/L)" className="w-full border p-2 rounded" value={vehData.consumption} onChange={e => setVehData({...vehData, consumption: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Preço Combustível (R$/L)" className="w-full border p-2 rounded" value={vehData.fuel_price} onChange={e => setVehData({...vehData, fuel_price: e.target.value})} />
            <div className="flex justify-end space-x-2 pt-2"><button type="button" onClick={()=>setIsVehModalOpen(false)}>Cancelar</button><button className="bg-[#0a5c36] text-white px-4 py-2 rounded">Salvar</button></div>
          </form>
        </div>
      )}

      {/* Modal Despesa */}
      {isExpModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={saveExpense} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg mb-4">Lançar Despesa</h2>
            <select required className="w-full border p-2 rounded" value={expData.vehicle_id} onChange={e => setExpData({...expData, vehicle_id: e.target.value})}>
              <option value="">Selecione o Veículo</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input required placeholder="Descrição (Ex: Troca de Óleo)" className="w-full border p-2 rounded" value={expData.description} onChange={e => setExpData({...expData, description: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Valor (R$)" className="w-full border p-2 rounded" value={expData.amount} onChange={e => setExpData({...expData, amount: e.target.value})} />
            <div className="flex justify-end space-x-2 pt-2"><button type="button" onClick={()=>setIsExpModalOpen(false)}>Cancelar</button><button className="bg-red-600 text-white px-4 py-2 rounded">Lançar Gastos</button></div>
          </form>
        </div>
      )}
    </div>
  );
};