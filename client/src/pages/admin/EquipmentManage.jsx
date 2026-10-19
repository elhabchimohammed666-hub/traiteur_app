import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit,
  History,
  Wrench,
  CheckCircle2,
  X,
  ArrowUpDown
} from 'lucide-react';

export default function EquipmentManage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [movementLogs, setMovementLogs] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'mobilier',
    rentalPrice: 50,
    totalQuantity: 10,
    alertThreshold: 3,
    replacementValue: 200,
    isRentableAlone: true
  });

  const [adjustForm, setAdjustForm] = useState({
    type: 'breakage', // purchase, breakage, loss, repair, inventory_adjustment
    quantity: 1,
    reason: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminEquipment();
      setEquipmentList(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      category: 'mobilier',
      rentalPrice: 50,
      totalQuantity: 10,
      alertThreshold: 3,
      replacementValue: 200,
      isRentableAlone: true
    });
    setShowItemModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      rentalPrice: item.rentalPrice,
      totalQuantity: item.totalQuantity,
      alertThreshold: item.alertThreshold || 3,
      replacementValue: item.replacementValue || 0,
      isRentableAlone: item.isRentableAlone !== false
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateEquipment(editingItem._id, itemForm);
      } else {
        await api.createEquipment(itemForm);
      }
      setShowItemModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleOpenAdjust = (item) => {
    setAdjustTarget(item);
    setAdjustForm({
      type: 'breakage',
      quantity: 1,
      reason: ''
    });
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustTarget) return;
    try {
      await api.adjustStock(adjustTarget._id, adjustForm);
      setShowAdjustModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'ajustement du stock.');
    }
  };

  const handleViewMovements = async (item) => {
    setAdjustTarget(item);
    setShowMovementsModal(true);
    try {
      setLoadingMovements(true);
      const res = await api.getEquipmentMovements(item._id);
      setMovementLogs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovements(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'tente', label: 'Tentes Caïdales' },
    { id: 'mobilier', label: 'Mobilier & Salons' },
    { id: 'vaisselle', label: 'Vaisselle & Couverts' },
    { id: 'nappage', label: 'Nappage & Linge' },
    { id: 'cuisine', label: 'Matériel de Cuisine' },
    { id: 'decoration', label: 'Décoration & Art' },
    { id: 'sono', label: 'Sonorisation & Lumière' }
  ];

  const filtered = equipmentList.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
            Inventaire & Stock de Matériel
          </h1>
          <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            Suivi des tentes caïdales, mobilier impérial, vaisselle fine et alertes de casse.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-sable-dark p-4 rounded-2xl border border-safran/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-safran absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher article, tente, vaisselle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none w-full sm:w-auto"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Table */}
      <div className="bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-safran animate-pulse">
            Chargement des articles de stock...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-anthracite/50 dark:text-[#F3ECDD]/50">
            Aucun matériel trouvé dans cette sélection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sable/30 dark:bg-sable-dark/60 text-anthracite/70 dark:text-[#F3ECDD]/70 border-b border-safran/20 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Article / Catégorie</th>
                  <th className="px-4 py-3">Prix Location</th>
                  <th className="px-4 py-3">Total en Stock</th>
                  <th className="px-4 py-3">Hors Service</th>
                  <th className="px-4 py-3">Disponible</th>
                  <th className="px-4 py-3">Alerte Seuil</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-safran/10">
                {filtered.map((item) => {
                  const isLow = (item.availableQuantity ?? item.totalQuantity) <= (item.alertThreshold || 3);
                  return (
                    <tr key={item._id} className="hover:bg-safran/5 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-anthracite dark:text-[#F3ECDD] block">
                          {item.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-safran">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold font-serif text-safran">
                        {item.rentalPrice} MAD / j
                      </td>
                      <td className="px-4 py-3 font-bold text-anthracite dark:text-[#F3ECDD]">
                        {item.totalQuantity}
                      </td>
                      <td className="px-4 py-3">
                        {item.outOfServiceQuantity > 0 ? (
                          <span className="text-red-500 font-semibold flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5" />
                            {item.outOfServiceQuantity}
                          </span>
                        ) : (
                          <span className="text-anthracite/40 dark:text-[#F3ECDD]/40">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.availableQuantity ?? item.totalQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-anthracite/60 dark:text-[#F3ECDD]/60">
                        {item.alertThreshold || 3}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="p-1.5 rounded-lg bg-sable/30 hover:bg-safran/20 text-anthracite dark:text-[#F3ECDD] transition"
                          title="Ajuster le stock / Casse"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 text-safran" />
                        </button>
                        <button
                          onClick={() => handleViewMovements(item)}
                          className="p-1.5 rounded-lg bg-sable/30 hover:bg-safran/20 text-anthracite dark:text-[#F3ECDD] transition"
                          title="Historique des mouvements"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-zellige text-white hover:bg-zellige-dark transition"
                          title="Modifier la fiche"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Create / Edit Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-md w-full border border-safran space-y-4">
            <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
              {editingItem ? 'Modifier l\'Article' : 'Ajouter un Article au Stock'}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Nom du Matériel *</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Catégorie</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  >
                    <option value="tente">Tente Caïdale</option>
                    <option value="mobilier">Mobilier & Salons</option>
                    <option value="vaisselle">Vaisselle & Couverts</option>
                    <option value="nappage">Nappage & Linge</option>
                    <option value="cuisine">Cuisine</option>
                    <option value="decoration">Décoration</option>
                    <option value="sono">Sonorisation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Prix Location (MAD/j)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.rentalPrice}
                    onChange={(e) => setItemForm({ ...itemForm, rentalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Quantité Totale</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.totalQuantity}
                    onChange={(e) => setItemForm({ ...itemForm, totalQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Seuil d'Alerte</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.alertThreshold}
                    onChange={(e) => setItemForm({ ...itemForm, alertThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-lg border border-safran/30 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-zellige text-white text-xs font-semibold shadow"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock / Breakage Modal */}
      {showAdjustModal && adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-md w-full border border-safran space-y-4">
            <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
              Ajustement Stock : {adjustTarget.name}
            </h3>
            <form onSubmit={handleSaveAdjust} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Nature du mouvement</label>
                <select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                >
                  <option value="breakage">Déclarer casse / dégradation (Hors service)</option>
                  <option value="repair">Retour de réparation (Remise en service)</option>
                  <option value="purchase">Nouvel achat (Augmentation stock)</option>
                  <option value="loss">Perte définitive</option>
                  <option value="inventory_adjustment">Ajustement d'inventaire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Quantité concernée</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Motif / Justification</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Casse lors du mariage ELH-2026-00042"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg border border-safran/30 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-zellige text-white text-xs font-semibold shadow"
                >
                  Enregistrer le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movements History Modal */}
      {showMovementsModal && adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-lg w-full border border-safran space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-safran/20 pb-3">
              <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
                Traçabilité des Mouvements : {adjustTarget.name}
              </h3>
              <button
                onClick={() => setShowMovementsModal(false)}
                className="p-1.5 rounded-lg hover:bg-safran/10 text-anthracite dark:text-[#F3ECDD]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingMovements ? (
              <div className="text-center py-10 text-xs text-safran animate-pulse">
                Chargement de l'historique...
              </div>
            ) : movementLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-anthracite/50 dark:text-[#F3ECDD]/50">
                Aucun mouvement tracé pour cet article.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {movementLogs.map((log) => (
                  <div key={log._id} className="p-3 rounded-xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/10 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="capitalize text-safran">{log.type}</span>
                      <span>Quantité : {log.quantity}</span>
                    </div>
                    <div className="text-anthracite/80 dark:text-[#F3ECDD]/80">{log.reason}</div>
                    <div className="text-[10px] text-anthracite/50 dark:text-[#F3ECDD]/50">
                      Par : {log.author} · {new Date(log.date || log.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
