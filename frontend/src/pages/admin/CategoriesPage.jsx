import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiCornerDownRight } from 'react-icons/fi';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', parentId: '', order: 0 });
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await client.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null, defaultParentId = '') => {
    setError('');
    if (cat) {
      setEditingCat(cat);
      setFormData({
        name: cat.name || '',
        parentId: cat.parentId || '',
        order: cat.order ?? 0,
      });
    } else {
      setEditingCat(null);
      setFormData({
        name: '',
        parentId: defaultParentId || '',
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        parentId: formData.parentId || null,
        order: Number(formData.order || 0),
      };
      if (editingCat) {
        await client.put(`/categories/${editingCat.id}`, payload);
      } else {
        await client.post('/categories', payload);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.message ||
          'Error al guardar la categoría'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    try {
      await client.delete(`/categories/${cat.id}`);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar la categoría');
    }
  };

  const parentOptions = [
    { value: '', label: 'Ninguna (Categoría Principal)' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-brand-border/20">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Organización del Catálogo
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-content mt-0.5">
            Categorías y Subcategorías
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Administrá la jerarquía de rubros de la tienda
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          className="inline-flex items-center self-start sm:self-auto py-2.5 text-xs"
        >
          <FiPlus className="mr-1.5" /> Nueva Categoría
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((parent) => (
          <div
            key={parent.id}
            className="bg-surface rounded-lg border border-brand-border/20 overflow-hidden"
          >
            <div className="p-4 sm:p-5 flex items-center justify-between bg-surface-elevated/40 border-b border-brand-border/15">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-brand/40 text-mauve border border-brand-border/25">
                  <FiTag size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-content">{parent.name}</h3>
                  <p className="text-[11px] text-content-muted font-mono">
                    /{parent.slug} &bull; {parent._count?.products || 0} productos directos &bull;{' '}
                    {(parent.children || []).length} subcategorías
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenModal(null, parent.id)}
                  className="text-[11px] py-1 px-2.5"
                >
                  <FiPlus className="mr-1" /> Subcategoría
                </Button>
                <button
                  type="button"
                  onClick={() => handleOpenModal(parent)}
                  className="p-1.5 text-content-secondary hover:text-content rounded hover:bg-surface-elevated"
                  title="Editar categoría"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(parent)}
                  className="p-1.5 text-content-muted hover:text-rose-400 rounded hover:bg-surface-elevated"
                  title="Eliminar categoría"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            {Array.isArray(parent.children) && parent.children.length > 0 && (
              <div className="divide-y divide-brand-border/10">
                {parent.children.map((sub) => (
                  <div
                    key={sub.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-surface-elevated/25 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 pl-4">
                      <FiCornerDownRight className="text-mauve text-xs" />
                      <div>
                        <span className="text-xs font-medium text-content">{sub.name}</span>
                        <span className="text-[11px] text-content-muted font-mono ml-2">
                          ({sub._count?.products || 0} prod.)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(sub)}
                        className="p-1 text-content-secondary hover:text-content"
                        title="Editar subcategoría"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub)}
                        className="p-1 text-content-muted hover:text-rose-400"
                        title="Eliminar subcategoría"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCat ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Lubricantes y Cosmética"
          />

          <Select
            label="Categoría Padre"
            name="parentId"
            options={parentOptions}
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          />

          <Input
            label="Orden de visualización"
            type="number"
            name="order"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
          />

          {error && (
            <p className="text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded border border-rose-800/50">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
