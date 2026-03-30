import { useState, useEffect } from 'react';
import { Search, Plus, Edit, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export default function OS() {
  const [osList, setOsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOS();
  }, []);

  const fetchOS = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/os', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOsList(data);
    } catch (error) {
      console.error('Erro ao buscar OS:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Finalizada':
      case 'approved':
        return <CheckCircle className="text-[#0a5c36]" size={16} />;
      case 'Em andamento':
      case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'Aguardando peça':
      case 'refused':
        return <AlertCircle className="text-red-600" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Finalizada':
      case 'approved':
        return 'bg-green-100 text-[#0a5c36] border border-green-200';
      case 'Em andamento':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Aguardando peça':
      case 'refused':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovada';
      case 'refused': return 'Recusada';
      default: return status;
    }
  };

  const filteredOS = osList.filter((os: any) => 
    os.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#0a5c36]">Ordens de Serviço</h2>
          <p className="text-gray-500 mt-1">Gerenciamento e acompanhamento de OS</p>
        </div>
        <button className="bg-[#8cc63f] hover:bg-[#7ab036] text-[#0a5c36] font-bold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform active:scale-95 shadow-md">
          <Plus size={20} />
          <span>Nova OS</span>
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent sm:text-sm transition-all shadow-sm"
              placeholder="Buscar por cliente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Técnico
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredOS.map((os: any) => (
                <tr key={os.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-500">#{os.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-800">{os.client_name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs mt-0.5">{os.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full items-center space-x-1.5 ${getStatusBadge(os.status)}`}>
                      {getStatusIcon(os.status)}
                      <span>{translateStatus(os.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-600">{os.technician_name || 'Não atribuído'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.total_value || 0)}
                    </div>
                    <div className={`text-xs font-medium mt-0.5 ${os.payment_status === 'Pago' ? 'text-[#0a5c36]' : 'text-red-500'}`}>
                      {os.payment_status || 'Pendente'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="p-2 text-gray-400 hover:text-[#0a5c36] hover:bg-[#8cc63f]/20 rounded-lg transition-colors" title="Editar OS">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOS.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-gray-500">Nenhuma ordem de serviço encontrada.</p>
                      <p className="text-sm mt-1">Tente ajustar os termos da sua busca.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
