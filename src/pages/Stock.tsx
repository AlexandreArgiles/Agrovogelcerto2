import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Boxes,
  Edit,
  FolderTree,
  Package,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const initialSectionForm = { name: '', description: '', sort_order: '0' };
const initialSubdivisionForm = { section_id: '', name: '', description: '', sort_order: '0' };
const initialItemForm = {
  subdivision_id: '',
  name: '',
  sku: '',
  quantity: '0',
  min_quantity: '0',
  unit: 'un',
  unit_cost: '0',
  notes: ''
};

export const Stock = () => {
  const [data, setData] = useState<any>({ sections: [], summary: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState(initialSectionForm);
  const [subdivisionForm, setSubdivisionForm] = useState(initialSubdivisionForm);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingSubdivision, setEditingSubdivision] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubdivisionModalOpen, setIsSubdivisionModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get('/api/stock');
      setData(response.data);
      if (!selectedSectionId && response.data.sections?.length) {
        setSelectedSectionId(response.data.sections[0].id);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel carregar o estoque.');
    }
  };

  const filteredSections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.sections || [];

    return (data.sections || [])
      .map((section: any) => {
        const filteredSubdivisions = (section.subdivisions || [])
          .map((subdivision: any) => {
            const filteredItems = (subdivision.items || []).filter((item: any) =>
              [item.name, item.sku, item.notes].some((field) => String(field || '').toLowerCase().includes(term))
            );

            const matchesSubdivision = [subdivision.name, subdivision.description]
              .some((field) => String(field || '').toLowerCase().includes(term));

            if (matchesSubdivision || filteredItems.length > 0) {
              return {
                ...subdivision,
                items: matchesSubdivision ? subdivision.items : filteredItems
              };
            }

            return null;
          })
          .filter(Boolean);

        const matchesSection = [section.name, section.description]
          .some((field) => String(field || '').toLowerCase().includes(term));

        if (matchesSection || filteredSubdivisions.length > 0) {
          return {
            ...section,
            subdivisions: matchesSection ? section.subdivisions : filteredSubdivisions
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [data.sections, searchTerm]);

  const selectedSection = useMemo(() => {
    return filteredSections.find((section: any) => section.id === selectedSectionId) || filteredSections[0] || null;
  }, [filteredSections, selectedSectionId]);

  useEffect(() => {
    if (selectedSection && selectedSection.id !== selectedSectionId) {
      setSelectedSectionId(selectedSection.id);
    }
  }, [selectedSection, selectedSectionId]);

  const openNewSectionModal = () => {
    setEditingSection(null);
    setSectionForm(initialSectionForm);
    setIsSectionModalOpen(true);
  };

  const openEditSectionModal = (section: any) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name || '',
      description: section.description || '',
      sort_order: String(section.sort_order ?? 0)
    });
    setIsSectionModalOpen(true);
  };

  const openNewSubdivisionModal = (sectionId?: number) => {
    setEditingSubdivision(null);
    setSubdivisionForm({
      ...initialSubdivisionForm,
      section_id: String(sectionId || selectedSection?.id || '')
    });
    setIsSubdivisionModalOpen(true);
  };

  const openEditSubdivisionModal = (subdivision: any) => {
    setEditingSubdivision(subdivision);
    setSubdivisionForm({
      section_id: String(subdivision.section_id || ''),
      name: subdivision.name || '',
      description: subdivision.description || '',
      sort_order: String(subdivision.sort_order ?? 0)
    });
    setIsSubdivisionModalOpen(true);
  };

  const openNewItemModal = (subdivisionId?: number) => {
    setEditingItem(null);
    setItemForm({
      ...initialItemForm,
      subdivision_id: String(subdivisionId || '')
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setItemForm({
      subdivision_id: String(item.subdivision_id || ''),
      name: item.name || '',
      sku: item.sku || '',
      quantity: String(item.quantity ?? 0),
      min_quantity: String(item.min_quantity ?? 0),
      unit: item.unit || 'un',
      unit_cost: String(item.unit_cost ?? 0),
      notes: item.notes || ''
    });
    setIsItemModalOpen(true);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...sectionForm,
        sort_order: Number(sectionForm.sort_order || 0)
      };

      if (editingSection) {
        await axios.put(`/api/stock/sections/${editingSection.id}`, payload);
      } else {
        await axios.post('/api/stock/sections', payload);
      }

      setIsSectionModalOpen(false);
      await fetchStock();
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel salvar o estoque.');
    }
  };

  const handleSubdivisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...subdivisionForm,
        section_id: Number(subdivisionForm.section_id),
        sort_order: Number(subdivisionForm.sort_order || 0)
      };

      if (editingSubdivision) {
        await axios.put(`/api/stock/subdivisions/${editingSubdivision.id}`, payload);
      } else {
        await axios.post('/api/stock/subdivisions', payload);
      }

      setIsSubdivisionModalOpen(false);
      await fetchStock();
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel salvar a sub divisao.');
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...itemForm,
        subdivision_id: Number(itemForm.subdivision_id),
        quantity: Number(itemForm.quantity || 0),
        min_quantity: Number(itemForm.min_quantity || 0),
        unit_cost: Number(itemForm.unit_cost || 0)
      };

      if (editingItem) {
        await axios.put(`/api/stock/items/${editingItem.id}`, payload);
      } else {
        await axios.post('/api/stock/items', payload);
      }

      setIsItemModalOpen(false);
      await fetchStock();
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Nao foi possivel salvar o item.');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Excluir esse estoque e todas as sub divisoes e itens dentro dele?')) return;
    await axios.delete(`/api/stock/sections/${sectionId}`);
    await fetchStock();
  };

  const handleDeleteSubdivision = async (subdivisionId: number) => {
    if (!window.confirm('Excluir essa sub divisao e todos os itens dentro dela?')) return;
    await axios.delete(`/api/stock/subdivisions/${subdivisionId}`);
    await fetchStock();
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Excluir esse item do estoque?')) return;
    await axios.delete(`/api/stock/items/${itemId}`);
    await fetchStock();
  };

  const allSubdivisions = (data.sections || []).flatMap((section: any) =>
    (section.subdivisions || []).map((subdivision: any) => ({
      ...subdivision,
      section_name: section.name
    }))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#0a5c36]">Estoque</h2>
          <p className="text-gray-500 mt-1">Organize estoques por nicho e crie sub divisoes editaveis para cada frente do negocio.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={openNewSectionModal} className="bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <Plus size={18} />
            Novo Estoque
          </button>
          <button onClick={() => openNewSubdivisionModal()} className="bg-[#8cc63f] hover:bg-[#7ab036] text-[#0a5c36] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <FolderTree size={18} />
            Nova Sub divisao
          </button>
          <button onClick={() => openNewItemModal()} className="bg-white border border-gray-200 hover:border-[#8cc63f] text-[#0a5c36] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <Package size={18} />
            Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Estoques</p>
          <p className="text-3xl font-black text-[#0a5c36] mt-2">{data.summary?.section_count || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Sub divisoes</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{data.summary?.subdivision_count || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Itens cadastrados</p>
          <p className="text-3xl font-black text-blue-700 mt-2">{data.summary?.item_count || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Valor estimado</p>
          <p className="text-3xl font-black text-amber-700 mt-2">{formatCurrency(data.summary?.stock_value || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative w-full xl:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:border-transparent text-sm"
            placeholder="Buscar por estoque, sub divisao, item ou codigo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Estoques</h3>
            <span className="text-sm text-gray-500">{filteredSections.length}</span>
          </div>

          {filteredSections.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Nenhum estoque encontrado.
            </div>
          )}

          {filteredSections.map((section: any) => (
            <button
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                selectedSection?.id === section.id
                  ? 'border-[#0a5c36] bg-green-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-[#8cc63f]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#0a5c36]">{section.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{section.description || 'Sem descricao'}</p>
                </div>
                <div className="flex gap-1">
                  <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-xs font-bold">{section.subdivision_count}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 text-xs">
                <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-1 font-semibold">{section.item_count} itens</span>
                {section.low_stock_count > 0 && (
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-1 font-semibold">{section.low_stock_count} baixos</span>
                )}
              </div>
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {selectedSection ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Estoque principal</p>
                    <h3 className="text-2xl font-bold text-[#0a5c36] mt-2">{selectedSection.name}</h3>
                    <p className="text-gray-500 mt-2">{selectedSection.description || 'Sem descricao cadastrada para esse estoque.'}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => openEditSectionModal(selectedSection)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:border-[#8cc63f] flex items-center gap-2">
                      <Edit size={16} />
                      Editar estoque
                    </button>
                    <button onClick={() => openNewSubdivisionModal(selectedSection.id)} className="px-4 py-2.5 rounded-xl bg-[#8cc63f] text-[#0a5c36] font-bold flex items-center gap-2">
                      <Plus size={16} />
                      Nova sub divisao
                    </button>
                    <button onClick={() => handleDeleteSection(selectedSection.id)} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {(selectedSection.subdivisions || []).map((subdivision: any) => (
                  <div key={subdivision.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{subdivision.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{subdivision.description || 'Sem descricao para essa sub divisao.'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-bold">{subdivision.item_count} itens</span>
                        {subdivision.low_stock_count > 0 && (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold flex items-center gap-1">
                            <AlertTriangle size={13} />
                            {subdivision.low_stock_count} baixos
                          </span>
                        )}
                        <button onClick={() => openEditSubdivisionModal(subdivision)} className="px-3 py-2 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:border-[#8cc63f] flex items-center gap-2 text-sm">
                          <Edit size={15} />
                          Editar
                        </button>
                        <button onClick={() => openNewItemModal(subdivision.id)} className="px-3 py-2 rounded-xl bg-[#0a5c36] text-white font-semibold flex items-center gap-2 text-sm">
                          <Plus size={15} />
                          Novo item
                        </button>
                        <button onClick={() => handleDeleteSubdivision(subdivision.id)} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2 text-sm">
                          <Trash2 size={15} />
                          Excluir
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Item</th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Codigo</th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Quantidade</th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Minimo</th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Custo</th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Observacoes</th>
                            <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Acoes</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {(subdivision.items || []).length > 0 ? (
                            subdivision.items.map((item: any) => {
                              const isLowStock = Number(item.quantity || 0) <= Number(item.min_quantity || 0);
                              return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-xl ${isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-[#0a5c36]'}`}>
                                        <Boxes size={18} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">Atualizado em {new Date(item.updated_at || item.created_at).toLocaleDateString('pt-BR')}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-sm text-slate-600">{item.sku || 'Sem codigo'}</td>
                                  <td className="px-5 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                      {Number(item.quantity || 0)} {item.unit || 'un'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-sm text-slate-600">{Number(item.min_quantity || 0)} {item.unit || 'un'}</td>
                                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{formatCurrency(Number(item.unit_cost || 0))}</td>
                                  <td className="px-5 py-4 text-sm text-slate-500">{item.notes || 'Sem observacoes'}</td>
                                  <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => openEditItemModal(item)} className="p-2 rounded-xl text-blue-600 hover:bg-blue-50">
                                        <Edit size={16} />
                                      </button>
                                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 rounded-xl text-red-600 hover:bg-red-50">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                                Nenhum item nessa sub divisao ainda.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {(selectedSection.subdivisions || []).length === 0 && (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-10 text-center text-gray-500">
                    Esse estoque ainda nao tem sub divisoes.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-10 text-center text-gray-500">
              Crie um estoque principal para comecar.
            </div>
          )}
        </div>
      </div>

      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSectionSubmit} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingSection ? 'Editar estoque' : 'Novo estoque'}</h2>
              <button type="button" onClick={() => setIsSectionModalOpen(false)} className="hover:text-green-200"><X size={22} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do estoque</label>
                <input required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descricao</label>
                <textarea className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" rows={3} value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
                <input type="number" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={sectionForm.sort_order} onChange={(e) => setSectionForm({ ...sectionForm, sort_order: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl">Salvar estoque</button>
            </div>
          </form>
        </div>
      )}

      {isSubdivisionModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSubdivisionSubmit} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingSubdivision ? 'Editar sub divisao' : 'Nova sub divisao'}</h2>
              <button type="button" onClick={() => setIsSubdivisionModalOpen(false)} className="hover:text-green-200"><X size={22} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estoque principal</label>
                <select required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={subdivisionForm.section_id} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, section_id: e.target.value })}>
                  <option value="">Selecione</option>
                  {(data.sections || []).map((section: any) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da sub divisao</label>
                <input required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={subdivisionForm.name} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descricao</label>
                <textarea className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" rows={3} value={subdivisionForm.description} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
                <input type="number" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={subdivisionForm.sort_order} onChange={(e) => setSubdivisionForm({ ...subdivisionForm, sort_order: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl">Salvar sub divisao</button>
            </div>
          </form>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleItemSubmit} className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#0a5c36] p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{editingItem ? 'Editar item' : 'Novo item de estoque'}</h2>
              <button type="button" onClick={() => setIsItemModalOpen(false)} className="hover:text-green-200"><X size={22} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sub divisao</label>
                <select required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.subdivision_id} onChange={(e) => setItemForm({ ...itemForm, subdivision_id: e.target.value })}>
                  <option value="">Selecione</option>
                  {allSubdivisions.map((subdivision: any) => (
                    <option key={subdivision.id} value={subdivision.id}>{subdivision.section_name} / {subdivision.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do item</label>
                <input required className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Codigo / SKU</label>
                <input className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.sku} onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade atual</label>
                <input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade minima</label>
                <input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.min_quantity} onChange={(e) => setItemForm({ ...itemForm, min_quantity: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unidade</label>
                <input className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Custo unitario</label>
                <input type="number" step="0.01" className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" value={itemForm.unit_cost} onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observacoes</label>
                <textarea className="w-full border border-gray-300 bg-gray-50 p-3 rounded-xl" rows={3} value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-[#0a5c36] hover:bg-[#0d7a48] text-white font-bold py-3 rounded-xl">Salvar item</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
