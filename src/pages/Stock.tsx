import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Boxes, Edit, FolderTree, Package, Plus, Search, Trash2, X } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const initialSectionForm = { name: '', description: '', sort_order: '0' };
const initialSubdivisionForm = { section_id: '', name: '', description: '', sort_order: '0' };
const initialItemForm = { subdivision_id: '', name: '', sku: '', quantity: '0', min_quantity: '0', unit: 'un', unit_cost: '0', customer_price: '0', notes: '' };

export const Stock = () => {
  const [data, setData] = useState<any>({ sections: [], summary: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState(initialSectionForm);
  const [subdivisionForm, setSubdivisionForm] = useState(initialSubdivisionForm);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingSubdivision, setEditingSubdivision] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubdivisionModalOpen, setIsSubdivisionModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  useEffect(() => { fetchStock(); }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get('/api/stock');
      const sections = response.data.sections || [];
      setData(response.data);

      const nextSectionId = sections.some((section: any) => section.id === selectedSectionId) ? selectedSectionId : sections[0]?.id ?? null;
      setSelectedSectionId(nextSectionId);
      const nextSection = sections.find((section: any) => section.id === nextSectionId);
      const subdivisions = nextSection?.subdivisions || [];
      const nextSubdivisionId = subdivisions.some((sub: any) => sub.id === selectedSubdivisionId) ? selectedSubdivisionId : subdivisions[0]?.id ?? null;
      setSelectedSubdivisionId(nextSubdivisionId);
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel carregar o estoque.');
    }
  };

  const filteredSections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.sections || [];

    return (data.sections || []).map((section: any) => {
      const filteredSubdivisions = (section.subdivisions || []).map((subdivision: any) => {
        const filteredItems = (subdivision.items || []).filter((item: any) =>
          [item.name, item.sku, item.notes].some((field) => String(field || '').toLowerCase().includes(term))
        );
        const matchesSubdivision = [subdivision.name, subdivision.description].some((field) => String(field || '').toLowerCase().includes(term));
        return matchesSubdivision || filteredItems.length ? { ...subdivision, items: matchesSubdivision ? subdivision.items : filteredItems } : null;
      }).filter(Boolean);

      const matchesSection = [section.name, section.description].some((field) => String(field || '').toLowerCase().includes(term));
      return matchesSection || filteredSubdivisions.length ? { ...section, subdivisions: matchesSection ? section.subdivisions : filteredSubdivisions } : null;
    }).filter(Boolean);
  }, [data.sections, searchTerm]);

  const selectedSection = useMemo(() =>
    filteredSections.find((section: any) => section.id === selectedSectionId) || filteredSections[0] || null
  , [filteredSections, selectedSectionId]);

  const selectedSubdivision = useMemo(() =>
    selectedSection?.subdivisions?.find((sub: any) => sub.id === selectedSubdivisionId) || selectedSection?.subdivisions?.[0] || null
  , [selectedSection, selectedSubdivisionId]);

  useEffect(() => {
    if (selectedSection && selectedSection.id !== selectedSectionId) setSelectedSectionId(selectedSection.id);
  }, [selectedSection, selectedSectionId]);

  useEffect(() => {
    const subdivisions = selectedSection?.subdivisions || [];
    if (!subdivisions.length) return setSelectedSubdivisionId(null);
    if (!subdivisions.some((sub: any) => sub.id === selectedSubdivisionId)) setSelectedSubdivisionId(subdivisions[0].id);
  }, [selectedSection, selectedSubdivisionId]);

  const openNewSectionModal = () => { setEditingSection(null); setSectionForm(initialSectionForm); setIsSectionModalOpen(true); };
  const openEditSectionModal = (section: any) => { setEditingSection(section); setSectionForm({ name: section.name || '', description: section.description || '', sort_order: String(section.sort_order ?? 0) }); setIsSectionModalOpen(true); };
  const openNewSubdivisionModal = (sectionId?: number) => { setEditingSubdivision(null); setSubdivisionForm({ ...initialSubdivisionForm, section_id: String(sectionId || selectedSection?.id || '') }); setIsSubdivisionModalOpen(true); };
  const openEditSubdivisionModal = (subdivision: any) => { setEditingSubdivision(subdivision); setSubdivisionForm({ section_id: String(subdivision.section_id || ''), name: subdivision.name || '', description: subdivision.description || '', sort_order: String(subdivision.sort_order ?? 0) }); setIsSubdivisionModalOpen(true); };
  const openNewItemModal = (subdivisionId?: number) => { setEditingItem(null); setItemForm({ ...initialItemForm, subdivision_id: String(subdivisionId || selectedSubdivision?.id || '') }); setIsItemModalOpen(true); };
  const openEditItemModal = (item: any) => { setEditingItem(item); setItemForm({ subdivision_id: String(item.subdivision_id || ''), name: item.name || '', sku: item.sku || '', quantity: String(item.quantity ?? 0), min_quantity: String(item.min_quantity ?? 0), unit: item.unit || 'un', unit_cost: String(item.unit_cost ?? 0), customer_price: String(item.customer_price ?? 0), notes: item.notes || '' }); setIsItemModalOpen(true); };

  const submitSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...sectionForm, sort_order: Number(sectionForm.sort_order || 0) };
      if (editingSection) await axios.put(`/api/stock/sections/${editingSection.id}`, payload);
      else await axios.post('/api/stock/sections', payload);
      setIsSectionModalOpen(false);
      await fetchStock();
    } catch (error: any) { window.alert(error?.response?.data?.message || 'Nao foi possivel salvar o estoque.'); }
  };

  const submitSubdivision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...subdivisionForm, section_id: Number(subdivisionForm.section_id), sort_order: Number(subdivisionForm.sort_order || 0) };
      if (editingSubdivision) await axios.put(`/api/stock/subdivisions/${editingSubdivision.id}`, payload);
      else await axios.post('/api/stock/subdivisions', payload);
      setIsSubdivisionModalOpen(false);
      await fetchStock();
    } catch (error: any) { window.alert(error?.response?.data?.message || 'Nao foi possivel salvar a sub divisao.'); }
  };

  const submitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...itemForm, subdivision_id: Number(itemForm.subdivision_id), quantity: Number(itemForm.quantity || 0), min_quantity: Number(itemForm.min_quantity || 0), unit_cost: Number(itemForm.unit_cost || 0), customer_price: Number(itemForm.customer_price || 0) };
      if (editingItem) await axios.put(`/api/stock/items/${editingItem.id}`, payload);
      else await axios.post('/api/stock/items', payload);
      setIsItemModalOpen(false);
      await fetchStock();
    } catch (error: any) { window.alert(error?.response?.data?.message || 'Nao foi possivel salvar o item.'); }
  };

  const deleteSection = async (id: number) => { if (window.confirm('Excluir esse estoque e tudo dentro dele?')) { await axios.delete(`/api/stock/sections/${id}`); await fetchStock(); } };
  const deleteSubdivision = async (id: number) => { if (window.confirm('Excluir essa sub divisao e todos os itens?')) { await axios.delete(`/api/stock/subdivisions/${id}`); await fetchStock(); } };
  const deleteItem = async (id: number) => { if (window.confirm('Excluir esse item do estoque?')) { await axios.delete(`/api/stock/items/${id}`); await fetchStock(); } };

  const allSubdivisions = (data.sections || []).flatMap((section: any) => (section.subdivisions || []).map((subdivision: any) => ({ ...subdivision, section_name: section.name })));

  const cards = [
    { label: 'Estoques', value: data.summary?.section_count || 0 },
    { label: 'Sub divisoes', value: data.summary?.subdivision_count || 0 },
    { label: 'Itens', value: data.summary?.item_count || 0 },
    { label: 'Custo em estoque', value: formatCurrency(data.summary?.stock_value || 0) },
    { label: 'Preco p/ cliente', value: formatCurrency(data.summary?.client_value || 0) }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#0a5c36_0%,#11804b_58%,#9fd14e_100%)] text-white p-6 md:p-7 shadow-[0_24px_60px_rgba(10,92,54,0.22)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">Gestao de materiais</p>
            <h2 className="text-3xl font-bold mt-2">Seus estoques organizados por area</h2>
            <p className="text-white/85 mt-3 text-sm md:text-base">Selecione uma area na lateral, abra a subdivisao que quiser e gerencie os itens sem ficar trocando de tela.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={openNewSectionModal} className="bg-white text-[#0a5c36] font-bold px-4 py-3 rounded-xl flex items-center gap-2"><Plus size={18} />Novo Estoque</button>
            <button onClick={() => openNewSubdivisionModal()} className="bg-white/15 border border-white/15 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2"><FolderTree size={18} />Nova Sub divisao</button>
            <button onClick={() => openNewItemModal()} className="bg-white/15 border border-white/15 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2"><Package size={18} />Novo Item</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-gray-400">{card.label}</p>
            <p className="text-2xl md:text-3xl font-black text-[#0a5c36] mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-sm" placeholder="Buscar estoque, sub divisao ou item" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px,1fr] 2xl:grid-cols-[320px,1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 h-fit xl:sticky xl:top-4">
          <div className="px-2">
            <h3 className="text-lg font-bold text-[#0a5c36]">Estoques</h3>
            <p className="text-sm text-gray-500 mt-1">Escolha a area que voce quer visualizar.</p>
          </div>
          {filteredSections.length ? filteredSections.map((section: any) => (
            <button key={section.id} onClick={() => { setSelectedSectionId(section.id); setSelectedSubdivisionId(section.subdivisions?.[0]?.id ?? null); }} className={`w-full text-left rounded-2xl border p-4 transition-all ${selectedSection?.id === section.id ? 'border-[#0a5c36] bg-green-50 shadow-sm' : 'border-gray-100 bg-white hover:border-[#8cc63f]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#0a5c36]">{section.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{section.description || 'Sem descricao cadastrada.'}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/80 text-[#0a5c36]"><Boxes size={17} /></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 text-xs">
                <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-bold">{section.subdivision_count} sub divisoes</span>
                <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 font-bold">{section.item_count} itens</span>
              </div>
            </button>
          )) : <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">Nenhum estoque encontrado.</div>}
        </aside>

        {selectedSection ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#0a5c36]">{selectedSection.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">{selectedSection.description || 'Sem descricao cadastrada para esse estoque.'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => openEditSectionModal(selectedSection)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:border-[#8cc63f] flex items-center gap-2"><Edit size={16} />Editar estoque</button>
                  <button onClick={() => openNewSubdivisionModal(selectedSection.id)} className="px-4 py-2.5 rounded-xl bg-[#8cc63f] text-[#0a5c36] font-bold flex items-center gap-2"><Plus size={16} />Nova sub divisao</button>
                  <button onClick={() => deleteSection(selectedSection.id)} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2"><Trash2 size={16} />Excluir estoque</button>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-700 mb-3">Sub divisoes</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(selectedSection.subdivisions || []).length ? (selectedSection.subdivisions || []).map((subdivision: any) => (
                    <button key={subdivision.id} onClick={() => setSelectedSubdivisionId(subdivision.id)} className={`text-left rounded-2xl border p-5 transition-all ${selectedSubdivision?.id === subdivision.id ? 'border-[#0a5c36] bg-[var(--surface-100)] shadow-sm' : 'border-gray-100 bg-white hover:border-[#8cc63f]'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{subdivision.name}</p>
                          <p className="text-sm text-gray-500 mt-2">{subdivision.description || 'Sem descricao cadastrada.'}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-500"><FolderTree size={18} /></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-5 text-xs">
                        <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-bold">{subdivision.item_count} itens</span>
                        {subdivision.low_stock_count > 0 && <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 font-bold">{subdivision.low_stock_count} baixos</span>}
                      </div>
                    </button>
                  )) : <div className="xl:col-span-3 rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500">Esse estoque ainda nao tem sub divisoes.</div>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0a5c36]">Itens</h3>
                <p className="text-sm text-gray-500 mt-2">{selectedSubdivision ? `${selectedSection.name} / ${selectedSubdivision.name}` : 'Escolha uma sub divisao.'}</p>
              </div>
              {selectedSubdivision && (
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => openEditSubdivisionModal(selectedSubdivision)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:border-[#8cc63f] flex items-center gap-2"><Edit size={16} />Editar sub divisao</button>
                  <button onClick={() => openNewItemModal(selectedSubdivision.id)} className="px-4 py-2.5 rounded-xl bg-[#0a5c36] text-white font-bold flex items-center gap-2"><Plus size={16} />Novo item</button>
                  <button onClick={() => deleteSubdivision(selectedSubdivision.id)} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2"><Trash2 size={16} />Excluir sub divisao</button>
                </div>
              )}
            </div>

            {selectedSubdivision ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
                {(selectedSubdivision.items || []).length ? (selectedSubdivision.items || []).map((item: any) => {
                  const isLowStock = Number(item.quantity || 0) <= Number(item.min_quantity || 0);
                  return (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-3 rounded-2xl ${isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-[#0a5c36]'}`}><Package size={18} /></div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.sku || 'Sem codigo cadastrado'}</p>
                          </div>
                        </div>
                        {isLowStock && <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold inline-flex items-center gap-1"><AlertTriangle size={12} />Baixo</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400">Atual</p>
                          <p className="text-lg font-black text-slate-800 mt-2">{Number(item.quantity || 0)} {item.unit || 'un'}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400">Minimo</p>
                          <p className="text-lg font-black text-slate-800 mt-2">{Number(item.min_quantity || 0)} {item.unit || 'un'}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <p>Custo unitario: <span className="font-semibold text-slate-800">{formatCurrency(Number(item.unit_cost || 0))}</span></p>
                        <p>Preco para cliente: <span className="font-semibold text-slate-800">{formatCurrency(Number(item.customer_price || 0))}</span></p>
                        <p>Observacoes: <span className="font-semibold text-slate-800">{item.notes || 'Sem observacoes'}</span></p>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-5">
                        <button onClick={() => openEditItemModal(item)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:border-[#8cc63f] flex items-center gap-2 text-sm"><Edit size={15} />Editar item</button>
                        <button onClick={() => deleteItem(item.id)} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2 text-sm"><Trash2 size={15} />Excluir</button>
                      </div>
                    </div>
                  );
                }) : <div className="lg:col-span-2 rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500">Nenhum item nessa sub divisao ainda.</div>}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500 mt-5">Escolha uma sub divisao para visualizar os itens.</div>
            )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-10 text-center text-gray-500">Crie ou selecione um estoque principal para comecar.</div>
        )}
      </div>

      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={submitSection} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center"><h2 className="font-bold text-lg">{editingSection ? 'Editar estoque' : 'Novo estoque'}</h2><button type="button" onClick={() => setIsSectionModalOpen(false)} className="hover:text-green-200"><X size={22} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nome do estoque</label><input required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Descricao</label><textarea className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" rows={3} value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label><input type="number" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={sectionForm.sort_order} onChange={(e) => setSectionForm({ ...sectionForm, sort_order: e.target.value })} /></div>
              <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl">Salvar estoque</button>
            </div>
          </form>
        </div>
      )}

      {isSubdivisionModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={submitSubdivision} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center"><h2 className="font-bold text-lg">{editingSubdivision ? 'Editar sub divisao' : 'Nova sub divisao'}</h2><button type="button" onClick={() => setIsSubdivisionModalOpen(false)} className="hover:text-green-200"><X size={22} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Estoque principal</label><select required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={subdivisionForm.section_id} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, section_id: e.target.value })}><option value="">Selecione</option>{(data.sections || []).map((section: any) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nome da sub divisao</label><input required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={subdivisionForm.name} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, name: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Descricao</label><textarea className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" rows={3} value={subdivisionForm.description} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, description: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label><input type="number" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={subdivisionForm.sort_order} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, sort_order: e.target.value })} /></div>
              <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl">Salvar sub divisao</button>
            </div>
          </form>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={submitItem} className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center"><h2 className="font-bold text-lg">{editingItem ? 'Editar item' : 'Novo item de estoque'}</h2><button type="button" onClick={() => setIsItemModalOpen(false)} className="hover:text-green-200"><X size={22} /></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Sub divisao</label><select required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.subdivision_id} onChange={(e) => setItemForm({ ...itemForm, subdivision_id: e.target.value })}><option value="">Selecione</option>{allSubdivisions.map((subdivision: any) => <option key={subdivision.id} value={subdivision.id}>{subdivision.section_name} / {subdivision.name}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nome do item</label><input required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Codigo / SKU</label><input className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.sku} onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade atual</label><input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade minima</label><input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.min_quantity} onChange={(e) => setItemForm({ ...itemForm, min_quantity: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Unidade</label><input className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Custo interno</label><input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.unit_cost} onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Preco para o cliente</label><input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.customer_price} onChange={(e) => setItemForm({ ...itemForm, customer_price: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Observacoes</label><textarea className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" rows={3} value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })} /></div>
              <div className="md:col-span-2"><button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl">Salvar item</button></div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
