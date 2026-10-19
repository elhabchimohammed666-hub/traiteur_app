import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Check,
  Search,
  Sparkles,
  Layers,
  ChefHat,
  X
} from 'lucide-react';

export default function MenuManage() {
  const [activeTab, setActiveTab] = useState('dishes'); // dishes, packages, services
  const [dishes, setDishes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dish Modal
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: { fr: '', ar: '', en: '' },
    description: { fr: '' },
    category: 'plat',
    cuisineStyle: 'traditionnel',
    pricingType: 'per_person',
    price: 150,
    isActive: true
  });

  // Package Modal
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    name: { fr: '', ar: '', en: '' },
    description: { fr: '' },
    pricePerPerson: 450,
    minGuests: 50,
    maxGuests: 500,
    isActive: true
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dRes, pRes, sRes] = await Promise.all([
        api.getDishes(),
        api.getPackages(),
        api.getServices()
      ]);
      setDishes(dRes.data || []);
      setPackages(pRes.data || []);
      setServices(sRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Dish handlers
  const handleOpenDishCreate = () => {
    setEditingDish(null);
    setDishForm({
      name: { fr: '', ar: '', en: '' },
      description: { fr: '' },
      category: 'plat',
      cuisineStyle: 'traditionnel',
      pricingType: 'per_person',
      price: 150,
      isActive: true
    });
    setShowDishModal(true);
  };

  const handleOpenDishEdit = (d) => {
    setEditingDish(d);
    setDishForm({
      name: { fr: d.name?.fr || d.name || '', ar: d.name?.ar || '', en: d.name?.en || '' },
      description: { fr: d.description?.fr || d.description || '' },
      category: d.category || 'plat',
      cuisineStyle: d.cuisineStyle || 'traditionnel',
      pricingType: d.pricingType || 'per_person',
      price: d.price || 100,
      isActive: d.isActive !== false
    });
    setShowDishModal(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        await api.updateDish(editingDish._id, dishForm);
      } else {
        await api.createDish(dishForm);
      }
      setShowDishModal(false);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Désactiver ce plat du menu ?')) return;
    try {
      await api.deleteDish(id);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Erreur.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
            Catalogue Gastronomique & Formules
          </h1>
          <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            Gestion des plats royaux, formules d'apparat et prestations de service.
          </p>
        </div>

        {activeTab === 'dishes' && (
          <button
            onClick={handleOpenDishCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Plat</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-safran/20 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('dishes')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'dishes'
              ? 'border-safran text-zellige dark:text-safran'
              : 'border-transparent text-anthracite/60 dark:text-[#F3ECDD]/60'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Plats & Mets ({dishes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'packages'
              ? 'border-safran text-zellige dark:text-safran'
              : 'border-transparent text-anthracite/60 dark:text-[#F3ECDD]/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Formules d'Apparat ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'services'
              ? 'border-safran text-zellige dark:text-safran'
              : 'border-transparent text-anthracite/60 dark:text-[#F3ECDD]/60'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Services & Animation ({services.length})</span>
        </button>
      </div>

      {/* TAB 1: DISHES */}
      {activeTab === 'dishes' && (
        <div className="bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sable/30 dark:bg-sable-dark/60 text-anthracite/70 dark:text-[#F3ECDD]/70 border-b border-safran/20 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Plat / Intitulé</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Style</th>
                  <th className="px-4 py-3">Prix Unitaire</th>
                  <th className="px-4 py-3">Tarification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-safran/10">
                {dishes.map((dish) => (
                  <tr key={dish._id} className="hover:bg-safran/5 transition">
                    <td className="px-4 py-3">
                      <span className="font-bold text-anthracite dark:text-[#F3ECDD] block">
                        {dish.name?.fr || dish.name}
                      </span>
                      {dish.name?.ar && (
                        <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block font-arabic">
                          {dish.name.ar}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 uppercase text-[10px] font-bold text-safran">
                      {dish.category}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {dish.cuisineStyle}
                    </td>
                    <td className="px-4 py-3 font-serif font-bold text-safran">
                      {dish.price} MAD
                    </td>
                    <td className="px-4 py-3 text-[11px] text-anthracite/60 dark:text-[#F3ECDD]/60">
                      {dish.pricingType === 'per_person' ? 'Par convive' : 'Par plat / unité'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDishEdit(dish)}
                        className="p-1.5 rounded-lg bg-zellige text-white hover:bg-zellige-dark transition"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish._id)}
                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Désactiver"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="p-6 rounded-2xl bg-white dark:bg-sable-dark border border-safran/30 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-safran">
                  Formule Clé en Main
                </span>
                <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
                  {pkg.name?.fr || pkg.name}
                </h3>
                <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 line-clamp-3">
                  {pkg.description?.fr || pkg.description}
                </p>
              </div>

              <div className="pt-4 border-t border-safran/20 flex items-center justify-between">
                <div>
                  <span className="font-serif text-2xl font-bold text-safran">
                    {pkg.pricePerPerson}
                  </span>
                  <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 ml-1">
                    MAD / pers.
                  </span>
                </div>
                <span className="text-[11px] text-anthracite/60 dark:text-[#F3ECDD]/60">
                  {pkg.minGuests || 50} à {pkg.maxGuests || 500} pers.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SERVICES */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="p-4 rounded-xl bg-white dark:bg-sable-dark border border-safran/20 shadow-sm flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-anthracite dark:text-[#F3ECDD]">
                  {srv.name}
                </h4>
                <span className="text-[11px] uppercase font-semibold text-safran">
                  {srv.category}
                </span>
              </div>
              <span className="font-serif font-bold text-sm text-safran">
                {srv.price} MAD
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dish Modal */}
      {showDishModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-md w-full border border-safran space-y-4">
            <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
              {editingDish ? 'Modifier le Plat' : 'Nouveau Plat Gastronomique'}
            </h3>
            <form onSubmit={handleSaveDish} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Nom du plat (Français) *</label>
                <input
                  type="text"
                  required
                  value={dishForm.name.fr}
                  onChange={(e) => setDishForm({ ...dishForm, name: { ...dishForm.name, fr: e.target.value } })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Nom en Arabe</label>
                <input
                  type="text"
                  dir="rtl"
                  value={dishForm.name.ar}
                  onChange={(e) => setDishForm({ ...dishForm, name: { ...dishForm.name, ar: e.target.value } })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Catégorie</label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  >
                    <option value="entree">Entrée</option>
                    <option value="plat">Grand Plat</option>
                    <option value="mechoui">Méchoui</option>
                    <option value="patisserie">Pâtisserie</option>
                    <option value="boisson">Boisson</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Prix (MAD)</label>
                  <input
                    type="number"
                    min="0"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDishModal(false)}
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
    </div>
  );
}
