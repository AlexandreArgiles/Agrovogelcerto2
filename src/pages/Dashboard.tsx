import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, XCircle, FileText, ArrowRight, Car, Users, Wrench, MapPinned, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    refused: 0,
    completed: 0,
    total: 0,
    clients: 0,
    technicians: 0,
    vehicles: 0,
    revenue: 0,
    technicianCost: 0,
    fleetCost: 0,
    profit: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersResponse, clientsResponse, techniciansResponse, vehiclesResponse, expensesResponse] = await Promise.all([
          axios.get('/api/os'),
          axios.get('/api/clients'),
          axios.get('/api/technicians'),
          axios.get('/api/vehicles'),
          axios.get('/api/vehicles/expenses')
        ]);

        const orders = ordersResponse.data;
        const expenses = expensesResponse.data;
        const pending = orders.filter((o: any) => o.status === 'pending').length;
        const approved = orders.filter((o: any) => o.status === 'approved').length;
        const refused = orders.filter((o: any) => o.status === 'refused').length;
        const completed = orders.filter((o: any) => o.status === 'completed').length;
        const completedOrders = orders.filter((o: any) => o.status === 'completed');
        const revenue = completedOrders.reduce((acc: number, order: any) => acc + (order.final_price || 0), 0);
        const technicianCost = completedOrders.reduce((acc: number, order: any) => acc + (order.technician_count > 0 ? (order.final_technician_pay || 0) : 0), 0);
        const travelCost = completedOrders.reduce((acc: number, order: any) => acc + (order.travel_cost || 0), 0);
        const maintenanceCost = expenses.reduce((acc: number, expense: any) => acc + (expense.amount || 0), 0);
        const fleetCost = travelCost + maintenanceCost;
        const profit = revenue - technicianCost - fleetCost;

        setStats({
          pending,
          approved,
          refused,
          completed,
          total: orders.length,
          clients: clientsResponse.data.length,
          technicians: techniciansResponse.data.length,
          vehicles: vehiclesResponse.data.length,
          revenue,
          technicianCost,
          fleetCost,
          profit
        });
      } catch (error) {
        console.error('Falha ao buscar estatisticas', error);
      }
    };

    fetchStats();
  }, []);

  const primaryCards = [
    {
      title: 'Total de OS',
      value: stats.total,
      subtitle: 'Volume total registrado',
      icon: FileText,
      tone: 'text-slate-800',
      shell: 'bg-slate-100 text-slate-600',
      glow: 'bg-slate-50'
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      subtitle: 'Precisam de atencao',
      icon: Clock,
      tone: 'text-amber-700',
      shell: 'bg-amber-100 text-amber-600',
      glow: 'bg-amber-50'
    },
    {
      title: 'Aprovadas',
      value: stats.approved,
      subtitle: 'Prontas para execucao',
      icon: CheckCircle,
      tone: 'text-[var(--brand-900)]',
      shell: 'bg-green-100 text-[var(--brand-900)]',
      glow: 'bg-green-50'
    },
    {
      title: 'Concluidas',
      value: stats.completed,
      subtitle: 'Encerradas com sucesso',
      icon: CheckCircle,
      tone: 'text-blue-700',
      shell: 'bg-blue-100 text-blue-600',
      glow: 'bg-blue-50'
    }
  ];

  const supportCards = [
    { label: 'Clientes ativos', value: stats.clients, icon: Users, link: '/clients' },
    { label: 'Tecnicos', value: stats.technicians, icon: Wrench, link: '/technicians' },
    { label: 'Veiculos', value: stats.vehicles, icon: Car, link: '/vehicles' },
    { label: 'Recusadas', value: stats.refused, icon: XCircle, link: '/os' }
  ];

  const quickActions = [
    { title: 'Nova ordem de servico', description: 'Registrar atendimento com mais rapidez.', link: '/os', icon: FileText },
    { title: 'Mapa operacional', description: 'Visualizar equipes e clientes no territorio.', link: '/map', icon: MapPinned },
    { title: 'Cadastrar cliente', description: 'Expandir a base e manter dados organizados.', link: '/clients', icon: Users }
  ];

  const financeCards = [
    {
      label: 'Faturado',
      value: stats.revenue,
      icon: TrendingUp,
      tone: 'text-green-700',
      shell: 'bg-green-100 text-green-700'
    },
    {
      label: 'Custo tecnicos',
      value: stats.technicianCost,
      icon: Users,
      tone: 'text-blue-700',
      shell: 'bg-blue-100 text-blue-700'
    },
    {
      label: 'Custo frota',
      value: stats.fleetCost,
      icon: Car,
      tone: 'text-red-600',
      shell: 'bg-red-100 text-red-600'
    },
    {
      label: 'Lucro liquido',
      value: stats.profit,
      icon: DollarSign,
      tone: 'text-[var(--brand-900)]',
      shell: 'bg-[var(--surface-100)] text-[var(--brand-900)]'
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#0a5c36_0%,#11804b_55%,#93cb45_100%)] px-6 py-7 md:px-8 md:py-9 text-white shadow-[0_30px_70px_rgba(10,92,54,0.22)] relative overflow-hidden">
        <div className="absolute inset-y-0 right-[-10%] w-[320px] bg-white/10 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">Visao operacional</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">Sua operacao em um unico lugar</h1>
            <p className="text-white/85 mt-3 text-sm md:text-base leading-relaxed">
              Acompanhe o andamento das ordens, identifique gargalos rapidamente e acesse os modulos principais sem perder tempo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-full lg:min-w-[340px] lg:max-w-[380px]">
            {supportCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} to={card.link} className="rounded-2xl bg-white/14 border border-white/12 px-4 py-4 hover:bg-white/18 transition-colors backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/75">{card.label}</p>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/14">
                      <Icon size={18} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {primaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="app-card rounded-[24px] p-6 relative overflow-hidden">
              <div className={`absolute right-0 top-0 w-28 h-28 rounded-bl-[36px] -mr-4 -mt-4 ${card.glow}`} />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{card.title}</p>
                  <p className={`text-4xl font-bold mt-3 ${card.tone}`}>{card.value}</p>
                  <p className="text-sm text-slate-500 mt-2">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-2xl ${card.shell}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <div className="app-card rounded-[26px] p-6 md:p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-900)]">Atalhos rapidos</h2>
              <p className="text-sm text-slate-500 mt-1">As tarefas mais frequentes ficam a um clique.</p>
            </div>
            <Link to="/os" className="text-sm font-semibold text-[var(--brand-900)] inline-flex items-center gap-2 hover:text-[var(--brand-800)]">
              Ver ordens
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.link} className="rounded-[22px] border border-[var(--border-soft)] bg-white px-5 py-5 hover:border-[rgba(10,92,54,0.18)] hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--surface-100)] text-[var(--brand-900)] flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-slate-800">{action.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="app-card rounded-[26px] p-6 md:p-7">
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Leitura rapida</h2>
          <p className="text-sm text-slate-500 mt-1">Resumo do estado atual da operacao.</p>

          <div className="space-y-4 mt-6">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-700 font-bold">Atencao imediata</p>
              <p className="text-3xl font-bold text-amber-800 mt-2">{stats.pending}</p>
              <p className="text-sm text-amber-800/80 mt-1">ordens aguardando andamento</p>
            </div>

            <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-green-700 font-bold">Em bom ritmo</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{stats.approved + stats.completed}</p>
              <p className="text-sm text-green-800/80 mt-1">ordens aprovadas ou concluidas</p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-600 font-bold">Cobertura</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.clients}</p>
              <p className="text-sm text-slate-600 mt-1">clientes disponiveis para atendimento</p>
            </div>
          </div>
        </div>
      </section>

      <section className="app-card rounded-[26px] p-6 md:p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-900)]">Visao geral do financeiro</h2>
            <p className="text-sm text-slate-500 mt-1">Resumo rapido baseado nas OS concluidas e nos custos da frota.</p>
          </div>
          <Link to="/finance" className="text-sm font-semibold text-[var(--brand-900)] inline-flex items-center gap-2 hover:text-[var(--brand-800)]">
            Abrir financeiro
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {financeCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[22px] border border-[var(--border-soft)] bg-white px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">{card.label}</p>
                    <p className={`text-3xl font-black mt-3 ${card.tone}`}>
                      R$ {card.value.toFixed(2)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ${card.shell}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
