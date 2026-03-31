import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, TrendingUp, Users, Calendar, Eye, Wrench, Car, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getQuinzenaInfo = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = date.getMonth();
  const half = date.getDate() <= 15 ? 1 : 2;
  const key = `${year}-${String(month + 1).padStart(2, '0')}-${half}`;
  const monthLabel = format(date, 'MMMM', { locale: ptBR });
  const startDay = half === 1 ? 1 : 16;
  const endDay = half === 1 ? 15 : new Date(year, month + 1, 0).getDate();

  return {
    key,
    year,
    month,
    half,
    label: `${startDay} a ${endDay} de ${monthLabel} de ${year}`,
    shortLabel: `${monthLabel} / ${half === 1 ? '1a' : '2a'} quinzena`
  };
};

const currentQuinzenaKey = getQuinzenaInfo(new Date()).key;

export const Finance = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(currentQuinzenaKey);
  const [payerFilter, setPayerFilter] = useState<'all' | 'client' | 'partner'>('all');
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
      setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros', error);
      setOrders([]);
      setTechnicians([]);
      setExpenses([]);
    }
  };

  const completedOrders = useMemo(() => orders.filter((os) => os.status === 'completed'), [orders]);

  const periodOptions = useMemo(() => {
    const map = new Map<string, { key: string; label: string; shortLabel: string }>();

    [...completedOrders, ...expenses].forEach((entry: any) => {
      if (!entry?.created_at) return;
      const info = getQuinzenaInfo(entry.created_at);
      map.set(info.key, { key: info.key, label: info.label, shortLabel: info.shortLabel });
    });

    if (!map.has(currentQuinzenaKey)) {
      const current = getQuinzenaInfo(new Date());
      map.set(current.key, { key: current.key, label: current.label, shortLabel: current.shortLabel });
    }

    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [completedOrders, expenses]);

  useEffect(() => {
    if (!periodOptions.some((period) => period.key === selectedPeriod)) {
      setSelectedPeriod(periodOptions[0]?.key || currentQuinzenaKey);
    }
  }, [periodOptions, selectedPeriod]);

  const selectedPeriodInfo = useMemo(() => {
    return periodOptions.find((period) => period.key === selectedPeriod) || {
      key: currentQuinzenaKey,
      label: getQuinzenaInfo(new Date()).label,
      shortLabel: getQuinzenaInfo(new Date()).shortLabel
    };
  }, [periodOptions, selectedPeriod]);

  const filteredOrdersByPeriod = useMemo(() => {
    return completedOrders.filter((order) => getQuinzenaInfo(order.created_at).key === selectedPeriod);
  }, [completedOrders, selectedPeriod]);

  const filteredExpensesByPeriod = useMemo(() => {
    return expenses.filter((expense: any) => expense?.created_at && getQuinzenaInfo(expense.created_at).key === selectedPeriod);
  }, [expenses, selectedPeriod]);

  const visibleOrders = useMemo(() => {
    return filteredOrdersByPeriod.filter((order) => {
      const clientValue = Number(order.client_service_total || 0) + Number(order.customer_material_total || 0);
      const partnerValue = Number(order.partner_service_total || 0);

      if (payerFilter === 'client') return clientValue > 0;
      if (payerFilter === 'partner') return partnerValue > 0;
      return true;
    });
  }, [filteredOrdersByPeriod, payerFilter]);

  const tableOrders = visibleOrders;

  const totalClientRevenue = visibleOrders.reduce((acc, os) => acc + Number(os.client_service_total || 0) + Number(os.customer_material_total || 0), 0);
  const totalPartnerRevenue = visibleOrders.reduce((acc, os) => acc + Number(os.partner_service_total || 0), 0);
  const totalRevenue = totalClientRevenue + totalPartnerRevenue;
  const totalTechnicianPay = visibleOrders.reduce((acc, os) => acc + (os.technician_count > 0 ? Number(os.final_technician_pay || 0) : 0), 0);
  const totalMaterialCost = visibleOrders.reduce((acc, os) => acc + Number(os.material_cost || 0), 0);
  const totalTravelCost = visibleOrders.reduce((acc, os) => acc + Number(os.travel_cost || 0), 0);
  const totalMaintenance = filteredExpensesByPeriod.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
  const totalFleetCost = totalTravelCost + totalMaintenance;
  const netProfit = totalRevenue - totalTechnicianPay - totalMaterialCost - totalFleetCost;

  const technicianTotals = useMemo(() => {
    const map = new Map<number, { id: number; name: string; total: number }>();

    technicians.forEach((technician) => {
      map.set(technician.id, { id: technician.id, name: technician.name, total: 0 });
    });

    visibleOrders.forEach((order) => {
      if (!order.technician_count || !order.final_technician_pay) return;
      const perTechnician = Number(order.final_technician_pay || 0) / Number(order.technician_count || 1);
      const orderTechnicians = technicians.filter((technician) => {
        return Array.isArray(order.technicians)
          ? order.technicians.some((assigned: any) => assigned.id === technician.id)
          : true;
      });

      if (orderTechnicians.length === 0) return;

      orderTechnicians.forEach((technician) => {
        const current = map.get(technician.id);
        if (current) current.total += perTechnician;
      });
    });

    return Array.from(map.values())
      .filter((technician) => technician.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [technicians, visibleOrders]);

  const historyPeriods = useMemo(() => {
    return periodOptions.map((period) => {
      const ordersInPeriod = completedOrders.filter((order) => getQuinzenaInfo(order.created_at).key === period.key);
      const expensesInPeriod = expenses.filter((expense: any) => expense?.created_at && getQuinzenaInfo(expense.created_at).key === period.key);

      const clientRevenue = ordersInPeriod.reduce((acc, os) => acc + Number(os.client_service_total || 0) + Number(os.customer_material_total || 0), 0);
      const partnerRevenue = ordersInPeriod.reduce((acc, os) => acc + Number(os.partner_service_total || 0), 0);
      const technicianCost = ordersInPeriod.reduce((acc, os) => acc + (os.technician_count > 0 ? Number(os.final_technician_pay || 0) : 0), 0);
      const materialCost = ordersInPeriod.reduce((acc, os) => acc + Number(os.material_cost || 0), 0);
      const travelCost = ordersInPeriod.reduce((acc, os) => acc + Number(os.travel_cost || 0), 0);
      const maintenanceCost = expensesInPeriod.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
      const revenue = clientRevenue + partnerRevenue;
      const profit = revenue - technicianCost - materialCost - travelCost - maintenanceCost;

      return {
        ...period,
        ordersCount: ordersInPeriod.length,
        revenue,
        clientRevenue,
        partnerRevenue,
        profit
      };
    });
  }, [completedOrders, expenses, periodOptions]);

  return (
    <div className="animate-in fade-in duration-500 max-w-full space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Painel Financeiro</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">O financeiro agora vira por quinzena e o historico fica salvo pelos periodos.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
            <Calendar size={16} className="text-[#0a5c36]" />
            <select className="bg-transparent outline-none min-w-[210px]" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              {periodOptions.map((period) => (
                <option key={period.key} value={period.key}>{period.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
            <Filter size={16} className="text-[#0a5c36]" />
            <select className="bg-transparent outline-none min-w-[170px]" value={payerFilter} onChange={(e) => setPayerFilter(e.target.value as 'all' | 'client' | 'partner')}>
              <option value="all">Todos os pagadores</option>
              <option value="client">Cliente final</option>
              <option value="partner">Empresa parceira</option>
            </select>
          </label>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#0a5c36_0%,#11804b_100%)] rounded-3xl p-6 text-white shadow-[0_24px_60px_rgba(10,92,54,0.20)]">
        <p className="text-xs uppercase tracking-[0.22em] text-green-100/80">Quinzena em foco</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedPeriodInfo.label}</h2>
            <p className="text-sm text-green-100 mt-2">
              {visibleOrders.length} OS concluida(s) no filtro atual e {filteredExpensesByPeriod.length} despesa(s) de frota neste periodo.
            </p>
          </div>
          <div className="rounded-2xl bg-white/12 px-4 py-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-green-100/80">Lucro liquido da quinzena</p>
            <p className="text-3xl font-black mt-2">R$ {netProfit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Faturado</p>
            <h2 className="text-xl font-black text-green-700">R$ {totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 flex items-center space-x-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente Final</p>
            <h2 className="text-xl font-black text-emerald-700">R$ {totalClientRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-5 flex items-center space-x-4">
          <div className="bg-sky-100 p-4 rounded-full text-sky-600"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Parceiras</p>
            <h2 className="text-xl font-black text-sky-700">R$ {totalPartnerRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Wrench size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tecnicos</p>
            <h2 className="text-xl font-black text-blue-700">R$ {totalTechnicianPay.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 flex items-center space-x-4">
          <div className="bg-red-100 p-4 rounded-full text-red-600"><Car size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frota</p>
            <h2 className="text-xl font-black text-red-600">R$ {totalFleetCost.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-[#0a5c36] rounded-xl shadow-md p-5 flex items-center space-x-4 text-white">
          <div className="bg-white/20 p-4 rounded-full text-white"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-green-100 uppercase tracking-wider">Lucro Liquido</p>
            <h2 className="text-xl font-black">R$ {netProfit.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-700 flex items-center">
            <Calendar size={20} className="mr-2 text-[#0a5c36]" /> Historico de Quinzenas
          </h3>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{historyPeriods.length} periodo(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {historyPeriods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`text-left rounded-2xl border p-4 transition-all ${selectedPeriod === period.key ? 'border-[#0a5c36] bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-green-200 hover:bg-green-50/60'}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{period.shortLabel}</p>
              <p className="text-sm font-semibold text-gray-700 mt-2">{period.label}</p>
              <p className="text-xl font-black text-[#0a5c36] mt-3">R$ {period.revenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{period.ordersCount} OS concluida(s)</p>
              <p className="text-xs text-gray-500 mt-2">Cliente: R$ {period.clientRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Parceira: R$ {period.partnerRevenue.toFixed(2)}</p>
              <p className="text-sm font-bold mt-3 text-gray-800">Lucro: R$ {period.profit.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-700 flex items-center mb-5 border-b pb-3">
          <Wrench size={20} className="mr-2 text-blue-600" /> Valores da Quinzena por Tecnico
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicianTotals.map((technician) => (
            <div key={technician.id} className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-blue-900 truncate max-w-[150px]">{technician.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase mt-0.5">Nesta quinzena</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-blue-700">R$ {technician.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {technicianTotals.length === 0 && <p className="text-gray-500 text-sm">Nenhum valor de tecnico neste periodo.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-bold text-gray-700 flex items-center">
            <Calendar size={18} className="mr-2 text-gray-400" /> Lancamentos da Quinzena
          </h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Filtro atual: {payerFilter === 'all' ? 'todos os pagadores' : payerFilter === 'client' ? 'cliente final' : 'empresa parceira'}
          </p>
        </div>

        <div className="table-scroll">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">OS</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cliente Final</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Parceira</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Custo Tecnico</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Lucro da OS</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tableOrders.length > 0 ? (
                tableOrders.map((order) => {
                  const hasTechnician = order.technician_count > 0;
                  const finalTechCost = hasTechnician ? Number(order.final_technician_pay || 0) : 0;
                  const clientBilled = Number(order.client_service_total || 0) + Number(order.customer_material_total || 0);
                  const partnerBilled = Number(order.partner_service_total || 0);
                  const materialCost = Number(order.material_cost || 0);
                  const travelCost = Number(order.travel_cost || 0);
                  const osProfit = clientBilled + partnerBilled - finalTechCost - materialCost - travelCost;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">#{order.id}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(order.created_at), 'dd MMM yyyy', { locale: ptBR })}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">{order.client_name}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700">R$ {clientBilled.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-sky-700">R$ {partnerBilled.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        {hasTechnician ? `R$ ${finalTechCost.toFixed(2)}` : <span className="text-gray-400">R$ 0.00</span>}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0a5c36]">R$ {osProfit.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => navigate(`/os/${order.id}`)} className="text-gray-500 hover:text-[#0a5c36] p-1.5 transition-colors" title="Ver Detalhes da OS"><Eye size={20} strokeWidth={2.5} /></button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">Nenhum lancamento encontrado para os filtros escolhidos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
