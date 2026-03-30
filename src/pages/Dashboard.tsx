import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({ pending: 0, approved: 0, refused: 0, total: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/os');
        const orders = response.data;
        
        const pending = orders.filter((o: any) => o.status === 'pending').length;
        const approved = orders.filter((o: any) => o.status === 'approved').length;
        const refused = orders.filter((o: any) => o.status === 'refused').length;
        
        setStats({ pending, approved, refused, total: orders.length });
      } catch (error) {
        console.error('Falha ao buscar estatísticas', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Painel de Controle</h1>
          <p className="text-gray-500 mt-1">Visão geral das ordens de serviço</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total de OS</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
              <FileText size={28} />
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-yellow-600 font-semibold uppercase tracking-wider">Pendentes</p>
              <p className="text-4xl font-bold text-yellow-700 mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
              <Clock size={28} />
            </div>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-[#0a5c36] font-semibold uppercase tracking-wider">Aprovadas</p>
              <p className="text-4xl font-bold text-[#0a5c36] mt-2">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg text-[#0a5c36]">
              <CheckCircle size={28} />
            </div>
          </div>
        </div>

        {/* Refused Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-red-600 font-semibold uppercase tracking-wider">Recusadas</p>
              <p className="text-4xl font-bold text-red-700 mt-2">{stats.refused}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg text-red-600">
              <XCircle size={28} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
