import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, TrendingUp, Users, Calendar, Eye, Wrench, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Finance = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
    try {
      const [osRes, techRes, expRes] = await Promise.all([
        axios.get('/api/os'),
        axios.get('/api/technicians'),
        axios.get('/api/vehicles/expenses')
      ]);
      setOrders(Array.isArray(osRes.data) ? osRes.data : []);
      setTechnicians(Array.isArray(techRes.data) ? techRes.data : []);
      setExpenses(Array.isArray(expRes.data) ? expRes.data : []); // <-- Proteção aqui!
    } catch (error) {
      console.error('Erro ao buscar dados financeiros', error);
      // Evita a quebra garantindo arrays vazios
      setOrders([]); setTechnicians([]); setExpenses([]);
    }
  };

  const completedOrders = orders.filter(os => os.status === 'completed');
  
  // Faturamento Total
  const totalRevenue = completedOrders.reduce((acc, os) => acc + (os.final_price || 0), 0);
  
  // Custo com Técnicos (só soma se tiver alguém vinculado)
  const totalTechnicianPay = completedOrders.reduce((acc, os) => {
    const hasTechnician = os.technician_count > 0;
    return acc + (hasTechnician ? (os.final_technician_pay || 0) : 0);
  }, 0);
  
  // Custos com a Frota (Deslocação nas OS + Manutenções Lançadas)
  const totalTravelCost = completedOrders.reduce((acc, os) => acc + (os.travel_cost || 0), 0);
  const totalMaintenance = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalFleetCost = totalTravelCost + totalMaintenance;

  // Lucro Líquido Final (Faturado - Técnicos - Deslocação - Manutenção)
  const netProfit = totalRevenue - totalTechnicianPay - totalFleetCost;

  return (
    <div className="animate-in fade-in duration-500 max-w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Painel Financeiro</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Resumo de faturação, comissões e custos operacionais</p>
      </div>

      {/* CARDS DE RESUMO GERAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Faturado</p>
            <h2 className="text-xl font-black text-green-700">R$ {totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custo Técnicos</p>
            <h2 className="text-xl font-black text-blue-700">R$ {totalTechnicianPay.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 flex items-center space-x-4">
          <div className="bg-red-100 p-4 rounded-full text-red-600"><Car size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custo Frota</p>
            <h2 className="text-xl font-black text-red-600">R$ {totalFleetCost.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-[#0a5c36] rounded-xl shadow-md p-5 flex items-center space-x-4 text-white">
          <div className="bg-white/20 p-4 rounded-full text-white"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-green-100 uppercase tracking-wider">Lucro Líquido</p>
            <h2 className="text-xl font-black">R$ {netProfit.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* VALORES A PAGAR POR TÉCNICO */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-700 flex items-center mb-5 border-b pb-3">
          <Wrench size={20} className="mr-2 text-blue-600" /> Valores a Pagar por Técnico
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicians.map(t => (
            <div key={t.id} className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-blue-900 truncate max-w-[120px]">{t.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase mt-0.5">Saldo Acumulado</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-blue-700">R$ {(t.total_earned || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {technicians.length === 0 && <p className="text-gray-500 text-sm">Nenhum técnico cadastrado.</p>}
        </div>
      </div>

      {/* TABELA DE DETALHES FINANCEIROS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 flex items-center">
            <Calendar size={18} className="mr-2 text-gray-400" /> Histórico de Entradas (OS Concluídas)
          </h3>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">OS</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Faturado</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Custo Técnico</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Custo Combustível</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Lucro da OS</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => {
                  const hasTechnician = order.technician_count > 0;
                  const finalTechCost = hasTechnician ? (order.final_technician_pay || 0) : 0;
                  const travelCost = order.travel_cost || 0;
                  const osProfit = (order.final_price || 0) - finalTechCost - travelCost;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">#{order.id}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(order.created_at), "dd MMM yyyy", { locale: ptBR })}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">{order.client_name}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">R$ {(order.final_price || 0).toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        {hasTechnician ? `R$ ${finalTechCost.toFixed(2)}` : <span className="text-gray-400">R$ 0.00</span>}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">
                        {travelCost > 0 ? `- R$ ${travelCost.toFixed(2)}` : <span className="text-gray-400">R$ 0.00</span>}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">R$ {osProfit.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => navigate(`/os/${order.id}`)} className="text-gray-500 hover:text-[#0a5c36] p-1.5 transition-colors" title="Ver Detalhes da OS"><Eye size={20} strokeWidth={2.5} /></button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">Nenhuma OS concluída.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};