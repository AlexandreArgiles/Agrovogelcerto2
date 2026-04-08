import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Archive, CalendarDays, Database, FolderArchive, RefreshCw, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Backups = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/backups');
      setBackups(Array.isArray(response.data.backups) ? response.data.backups : []);
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel carregar os backups.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      await axios.post('/api/backups');
      await fetchBackups();
      window.alert('Backup manual criado com sucesso.');
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel criar o backup.');
    } finally {
      setIsCreating(false);
    }
  };

  const latestBackup = backups[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#0a5c36_0%,#11804b_58%,#9fd14e_100%)] text-white p-6 md:p-7 shadow-[0_24px_60px_rgba(10,92,54,0.22)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">Seguranca dos dados</p>
            <h2 className="text-3xl font-bold mt-2">Backups manuais e semanais</h2>
            <p className="text-white/85 mt-3 text-sm md:text-base">
              O sistema cria backup manual sob demanda e tambem verifica toda sexta-feira se ja existe um backup automatico do dia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleCreateBackup} disabled={isCreating} className="bg-white text-[#0a5c36] font-bold px-4 py-3 rounded-xl flex items-center gap-2 disabled:opacity-70">
              <Save size={18} />
              {isCreating ? 'Criando...' : 'Criar Backup Agora'}
            </button>
            <button onClick={fetchBackups} disabled={isLoading} className="bg-white/15 border border-white/15 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2 disabled:opacity-70">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Atualizar Lista
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Total de backups</p>
          <p className="text-2xl font-black text-[#0a5c36] mt-2">{backups.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Ultimo backup</p>
          <p className="text-sm font-bold text-slate-800 mt-2">
            {latestBackup?.created_at ? format(new Date(latestBackup.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR }) : 'Nenhum ainda'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Agendamento</p>
          <p className="text-sm font-bold text-slate-800 mt-2">Toda sexta-feira</p>
          <p className="text-xs text-gray-500 mt-1">O backup automatico e criado uma vez por sexta.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0a5c36]">Historico de Backups</h3>
            <p className="text-sm text-gray-500 mt-1">Os arquivos ficam guardados dentro da pasta `backups` do sistema.</p>
          </div>
        </div>

        <div className="space-y-3">
          {backups.length > 0 ? backups.map((backup) => (
            <div key={backup.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${backup.trigger === 'weekly-auto' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-[#0a5c36]'}`}>
                    <Archive size={13} />
                    {backup.trigger === 'weekly-auto' ? 'Sexta automatica' : 'Manual'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-bold">
                    <CalendarDays size={13} />
                    {backup.created_at ? format(new Date(backup.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR }) : 'Sem data'}
                  </span>
                </div>
                <p className="font-bold text-slate-800 mt-3">{backup.folder}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Database size={13} /> Banco: {backup.files?.database ? 'incluido' : 'nao encontrado'}</span>
                  <span className="inline-flex items-center gap-1"><FolderArchive size={13} /> Uploads: {backup.files?.uploads ? 'incluidos' : 'nao encontrados'}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Criado por: <span className="font-semibold text-slate-700">{backup.initiated_by || 'sistema'}</span>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
              Nenhum backup encontrado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
