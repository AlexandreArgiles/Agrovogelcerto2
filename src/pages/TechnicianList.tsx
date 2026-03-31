import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  Copy,
  Edit,
  Mail,
  Phone,
  Plus,
  Trash2,
  Wallet,
  X
} from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const getToday = () => new Date().toISOString().slice(0, 10);

export const TechnicianList = () => {
  const [techs, setTechs] = useState<any[]>([]);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', pix_key: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', paid_at: getToday(), note: '' });

  useEffect(() => {
    fetchTechs();
  }, []);

  const totals = useMemo(() => {
    return techs.reduce((acc, technician) => {
      acc.totalEarned += Number(technician.total_earned || 0);
      acc.totalPaid += Number(technician.total_paid || 0);
      acc.balanceDue += Number(technician.balance_due || 0);
      return acc;
    }, { totalEarned: 0, totalPaid: 0, balanceDue: 0 });
  }, [techs]);

  const fetchTechs = async () => {
    const res = await axios.get('/api/technicians');
    setTechs(res.data);
    return res.data;
  };

  const fetchPaymentHistory = async (technicianId: number) => {
    setIsLoadingPayments(true);
    try {
      const res = await axios.get(`/api/technicians/${technicianId}/payments`);
      setPaymentHistory(Array.isArray(res.data) ? res.data : []);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const resetTechForm = () => {
    setEditingTech(null);
    setFormData({ name: '', phone: '', email: '', pix_key: '' });
  };

  const openNewTechModal = () => {
    resetTechForm();
    setIsTechModalOpen(true);
  };

  const openEditTechModal = (technician: any) => {
    setEditingTech(technician);
    setFormData({
      name: technician.name || '',
      phone: technician.phone || '',
      email: technician.email || '',
      pix_key: technician.pix_key || ''
    });
    setIsTechModalOpen(true);
  };

  const handleSubmitTech = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTech) {
      await axios.put(`/api/technicians/${editingTech.id}`, formData);
    } else {
      await axios.post('/api/technicians', formData);
    }

    setIsTechModalOpen(false);
    resetTechForm();
    fetchTechs();
  };

  const openPaymentModal = async (technician: any) => {
    setSelectedTech(technician);
    setEditingPayment(null);
    setPaymentForm({
      amount: technician.balance_due ? Number(technician.balance_due).toFixed(2) : '',
      paid_at: getToday(),
      note: ''
    });
    setIsPaymentModalOpen(true);
    await fetchPaymentHistory(technician.id);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTech) return;

    try {
      const payload = {
        amount: Number(String(paymentForm.amount).replace(',', '.')),
        paid_at: paymentForm.paid_at,
        note: paymentForm.note
      };

      if (editingPayment) {
        await axios.put(`/api/technicians/${selectedTech.id}/payments/${editingPayment.id}`, payload);
      } else {
        await axios.post(`/api/technicians/${selectedTech.id}/payments`, payload);
      }

      await Promise.all([
        fetchPaymentHistory(selectedTech.id)
      ]);

      const refreshedTechs = await fetchTechs();
      const updatedTech = refreshedTechs.find((tech: any) => tech.id === selectedTech.id);
      setSelectedTech(updatedTech || selectedTech);
      setEditingPayment(null);
      setPaymentForm({
        amount: updatedTech?.balance_due ? Number(updatedTech.balance_due).toFixed(2) : '',
        paid_at: getToday(),
        note: ''
      });
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel registrar o pagamento.');
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setPaymentForm({
      amount: Number(payment.amount || 0).toFixed(2),
      paid_at: payment.paid_at || getToday(),
      note: payment.note || ''
    });
  };

  const handleCancelPaymentEdit = () => {
    setEditingPayment(null);
    setPaymentForm({
      amount: selectedTech?.balance_due ? Number(selectedTech.balance_due).toFixed(2) : '',
      paid_at: getToday(),
      note: ''
    });
  };

  const refreshSelectedTech = async () => {
    if (!selectedTech) return;
    const refreshedTechs = await fetchTechs();
    const updatedTech = refreshedTechs.find((tech: any) => tech.id === selectedTech.id);
    setSelectedTech(updatedTech || selectedTech);
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!selectedTech) return;
    if (!window.confirm('Remover esse lancamento de pagamento?')) return;

    await axios.delete(`/api/technicians/${selectedTech.id}/payments/${paymentId}`);
    await Promise.all([
      fetchPaymentHistory(selectedTech.id)
    ]);
    await refreshSelectedTech();
    if (editingPayment?.id === paymentId) {
      handleCancelPaymentEdit();
    }
  };

  const copyPixKey = async (pixKey: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
    } catch {
      window.alert('Nao foi possivel copiar a chave Pix.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a5c36]">Gestao de Tecnicos</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Cadastre chave Pix, acompanhe o que ja foi pago e o saldo pendente por tecnico.
          </p>
        </div>

        <button
          onClick={openNewTechModal}
          className="bg-[#8cc63f] text-[#0a5c36] font-bold px-4 py-3 rounded-xl flex items-center justify-center shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Novo Tecnico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Total Gerado</p>
          <p className="text-2xl font-black text-[#0a5c36] mt-2">{formatCurrency(totals.totalEarned)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Ja Pago</p>
          <p className="text-2xl font-black text-blue-700 mt-2">{formatCurrency(totals.totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Saldo Pendente</p>
          <p className="text-2xl font-black text-amber-600 mt-2">{formatCurrency(totals.balanceDue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {techs.map((technician) => (
          <div key={technician.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-[#0a5c36] truncate">{technician.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mt-4">
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{technician.phone || 'Sem telefone'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span>{technician.email || 'Sem e-mail'}</span>
                  </p>
                  <div className="flex items-start gap-2">
                    <Wallet size={16} className="text-gray-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-700">Chave Pix</p>
                      <p className="break-all text-gray-500">{technician.pix_key || 'Nao cadastrada'}</p>
                    </div>
                    {technician.pix_key && (
                      <button
                        type="button"
                        onClick={() => copyPixKey(technician.pix_key)}
                        className="text-[#0a5c36] hover:text-[#0d7a48] p-1 rounded-md hover:bg-green-50"
                        title="Copiar chave Pix"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditTechModal(technician)}
                  className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar tecnico"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Excluir tecnico?')) return;
                    await axios.delete(`/api/technicians/${technician.id}`);
                    fetchTechs();
                  }}
                  className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir tecnico"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">Gerado</p>
                <p className="text-lg font-black text-slate-800 mt-2">{formatCurrency(technician.total_earned || 0)}</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-blue-500">Pago</p>
                <p className="text-lg font-black text-blue-700 mt-2">{formatCurrency(technician.total_paid || 0)}</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-amber-600">Pendente</p>
                <p className="text-lg font-black text-amber-700 mt-2">{formatCurrency(technician.balance_due || 0)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-5">
              <div className="text-sm text-gray-500">
                Ultimo pagamento:{' '}
                <span className="font-semibold text-gray-700">
                  {technician.last_payment_at
                    ? new Date(`${technician.last_payment_at}T00:00:00`).toLocaleDateString('pt-BR')
                    : 'Nenhum registrado'}
                </span>
              </div>

              <button
                onClick={() => openPaymentModal(technician)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a5c36] px-4 py-3 text-sm font-bold text-white hover:bg-[#0d7a48] transition-colors"
              >
                <Banknote size={18} />
                Registrar Pagamento
              </button>
            </div>
          </div>
        ))}

        {techs.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-10 text-center text-gray-500 xl:col-span-2">
            Nenhum tecnico cadastrado ainda.
          </div>
        )}
      </div>

      {isTechModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSubmitTech} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingTech ? 'Editar Tecnico' : 'Cadastro de Tecnico'}</h2>
              <button type="button" onClick={() => setIsTechModalOpen(false)} className="hover:text-green-200">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  placeholder="Ex: Joao Silva"
                  required
                  className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                  <input
                    placeholder="(00) 00000-0000"
                    className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    placeholder="tecnico@agrovogel.com"
                    type="email"
                    className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chave Pix</label>
                <input
                  placeholder="CPF, telefone, e-mail ou chave aleatoria"
                  className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl transition-colors">
                  Salvar Tecnico
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isPaymentModalOpen && selectedTech && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">Pagamentos de {selectedTech.name}</h2>
                <p className="text-sm text-green-100 mt-1">Controle o que ja saiu e o que ainda falta pagar.</p>
              </div>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="hover:text-green-200">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6 max-h-[85vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <CalendarClock size={18} />
                    Resumo do tecnico
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-xl bg-white p-4 border border-slate-100">
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-slate-400">Saldo pendente</p>
                      <p className="text-2xl font-black text-amber-700 mt-2">{formatCurrency(selectedTech.balance_due || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-slate-100">
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-slate-400">Ja pago</p>
                      <p className="text-xl font-black text-blue-700 mt-2">{formatCurrency(selectedTech.total_paid || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-slate-100">
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-slate-400">Chave Pix</p>
                      <p className="text-sm font-semibold text-slate-700 mt-2 break-all">{selectedTech.pix_key || 'Nao cadastrada'}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitPayment} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-gray-800">
                      {editingPayment ? 'Editar lancamento' : 'Novo pagamento'}
                    </h3>
                    {editingPayment && (
                      <button
                        type="button"
                        onClick={handleCancelPaymentEdit}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Cancelar edicao
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Valor pago</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, amount: Number(selectedTech.balance_due || 0).toFixed(2) })}
                        className="text-xs font-bold px-3 py-2 rounded-full bg-amber-100 text-amber-800"
                      >
                        Quitar saldo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, amount: '' })}
                        className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 text-slate-700"
                      >
                        Pagamento parcial
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Data do pagamento</label>
                    <input
                      type="date"
                      required
                      className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                      value={paymentForm.paid_at}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paid_at: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Observacao</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: quinzena, servico pago na hora, adiantamento..."
                      className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl"
                      value={paymentForm.note}
                      onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!editingPayment && Number(selectedTech.balance_due || 0) <= 0}
                    className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingPayment ? 'Salvar correcao' : 'Registrar como pago'}
                  </button>

                  {!editingPayment && Number(selectedTech.balance_due || 0) <= 0 && (
                    <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Esse tecnico esta sem saldo pendente no momento.
                    </p>
                  )}
                </form>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Historico de pagamentos</h3>
                  <span className="text-sm text-gray-500">{paymentHistory.length} lancamento(s)</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {isLoadingPayments ? (
                    <div className="p-6 text-sm text-gray-500">Carregando pagamentos...</div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                      Nenhum pagamento registrado ainda para esse tecnico.
                    </div>
                  ) : (
                    paymentHistory.map((payment) => (
                      <div key={payment.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-[#0a5c36]">{formatCurrency(payment.amount || 0)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Pago em {new Date(`${payment.paid_at}T00:00:00`).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">{payment.note || 'Sem observacao'}</p>
                        </div>

                        <div className="flex gap-2 self-start">
                          <button
                            type="button"
                            onClick={() => handleEditPayment(payment)}
                            className="inline-flex items-center gap-2 text-blue-600 hover:bg-blue-50 rounded-xl px-3 py-2"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="inline-flex items-center gap-2 text-red-600 hover:bg-red-50 rounded-xl px-3 py-2"
                          >
                            <Trash2 size={16} />
                            Remover
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
