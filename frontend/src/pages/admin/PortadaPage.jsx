import React, { useState, useEffect, useCallback } from 'react';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import {
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLayout,
  FiCheck,
  FiX,
  FiSliders,
} from 'react-icons/fi';

const SECTION_TYPE_LABELS = {
  HERO: 'Hero Principal',
  CAMPAIGN_BANNER: 'Banner de Campaña',
  PRODUCT_GRID: 'Grilla de Productos',
  CATEGORY_GRID: 'Grilla de Categorías',
  COLLECTION: 'Colección Destacada',
  COUNTDOWN: 'Cuenta Regresiva',
  TEXT_BLOCK: 'Bloque Editorial / Sobre Nosotros',
  BENEFITS: 'Bloque de Beneficios',
  FAQ: 'Preguntas Frecuentes',
  NEWSLETTER: 'Newsletter / Suscripción',
};

const TEMPLATE_OPTIONS = [
  { key: 'base', name: 'Portada Base (Estándar)' },
  { key: 'black-friday', name: 'Black Friday (Agresiva + Countdown)' },
  { key: 'dia-de-la-madre', name: 'Día de la Madre (Banner + 15% OFF + 2x1)' },
  { key: 'cyber-sale', name: 'Cyber / Hot Sale (Hero tech + Ofertas)' },
  { key: 'san-valentin', name: 'San Valentín (Romántica + Parejas)' },
  { key: 'navidad', name: 'Navidad (Festiva + Regalos)' },
];

const PortadaPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('base');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Modal de edición / creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    type: 'CAMPAIGN_BANNER',
    enabled: true,
    title: '',
    subtitle: '',
    headline: '',
    subheadline: '',
    ctaText: '',
    ctaLink: '',
    badge: '',
    limit: 6,
    filter: 'campaign',
  });

  // Modal de plantilla
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('base');

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Cargar lista de campañas
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await client.get('/campaigns');
        setCampaigns(res.data || []);
      } catch (err) {
        console.error('Error al cargar campañas:', err);
      }
    };
    fetchCampaigns();
  }, []);

  // Cargar secciones de la campaña seleccionada
  const loadSections = useCallback(async () => {
    setLoading(true);
    try {
      const campParam = selectedCampaignId === 'base' ? 'base' : selectedCampaignId;
      const res = await client.get(`/home-sections?campaignId=${encodeURIComponent(campParam)}`);
      setSections(res.data?.sections || []);
    } catch (err) {
      console.error('Error al cargar secciones:', err);
      showToast('Error al cargar las secciones de la portada');
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // Manejo de Reordenamiento (Subir / Bajar)
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    // Actualizar órdenes
    const updatedWithOrder = newSections.map((s, idx) => ({ ...s, order: idx }));
    setSections(updatedWithOrder);

    try {
      await client.put('/home-sections/reorder', {
        items: updatedWithOrder.map((s) => ({ id: s.id, order: s.order })),
      });
      showToast('Orden actualizado con éxito');
    } catch (err) {
      console.error('Error al reordenar:', err);
      showToast('No se pudo guardar el nuevo orden');
      loadSections();
    }
  };

  // Toggle Activar / Desactivar
  const handleToggleEnabled = async (section) => {
    const updatedState = !section.enabled;
    try {
      await client.put(`/home-sections/${section.id}`, { enabled: updatedState });
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, enabled: updatedState } : s))
      );
      showToast(`Sección ${updatedState ? 'activada' : 'desactivada'}`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      showToast('Error al actualizar la sección');
    }
  };

  // Eliminar Sección
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseás eliminar esta sección de la portada?')) return;
    try {
      await client.delete(`/home-sections/${id}`);
      setSections((prev) => prev.filter((s) => s.id !== id));
      showToast('Sección eliminada con éxito');
    } catch (err) {
      console.error('Error al eliminar sección:', err);
      showToast('Error al eliminar la sección');
    }
  };

  // Abrir Modal para Crear o Editar
  const handleOpenEdit = (section = null) => {
    if (section) {
      setEditingSection(section);
      const conf = section.config || {};
      setFormData({
        type: section.type,
        enabled: section.enabled !== false,
        title: conf.title || '',
        subtitle: conf.subtitle || '',
        headline: conf.headline || '',
        subheadline: conf.subheadline || '',
        ctaText: conf.ctaText || '',
        ctaLink: conf.ctaLink || '',
        badge: conf.badge || '',
        limit: conf.limit || 6,
        filter: conf.filter || 'campaign',
      });
    } else {
      setEditingSection(null);
      setFormData({
        type: 'CAMPAIGN_BANNER',
        enabled: true,
        title: '',
        subtitle: '',
        headline: '',
        subheadline: '',
        ctaText: 'Ver Colección',
        ctaLink: selectedCampaignId !== 'base' ? `/campanas/${campaigns.find(c => c.id === selectedCampaignId)?.slug || ''}` : '/catalogo',
        badge: '',
        limit: 6,
        filter: 'campaign',
      });
    }
    setIsModalOpen(true);
  };

  // Guardar Sección (Crear o Actualizar)
  const handleSaveSection = async (e) => {
    e.preventDefault();
    const config = {
      title: formData.title,
      subtitle: formData.subtitle,
      headline: formData.headline,
      subheadline: formData.subheadline,
      ctaText: formData.ctaText,
      ctaLink: formData.ctaLink,
      badge: formData.badge,
      limit: Number(formData.limit || 6),
      filter: formData.filter,
    };

    try {
      if (editingSection) {
        await client.put(`/home-sections/${editingSection.id}`, {
          type: formData.type,
          enabled: formData.enabled,
          config,
        });
        showToast('Sección actualizada con éxito');
      } else {
        await client.post('/home-sections', {
          campaignId: selectedCampaignId === 'base' ? null : selectedCampaignId,
          type: formData.type,
          order: sections.length,
          enabled: formData.enabled,
          config,
        });
        showToast('Sección creada con éxito');
      }
      setIsModalOpen(false);
      loadSections();
    } catch (err) {
      console.error('Error al guardar sección:', err);
      showToast('Error al guardar la sección');
    }
  };

  // Aplicar Plantilla Sugerida
  const handleApplyTemplate = async () => {
    try {
      await client.post('/home-sections/apply-template', {
        campaignId: selectedCampaignId === 'base' ? null : selectedCampaignId,
        templateKey: selectedTemplateKey,
      });
      showToast('Plantilla aplicada correctamente');
      setIsTemplateModalOpen(false);
      loadSections();
    } catch (err) {
      console.error('Error al aplicar plantilla:', err);
      showToast('No se pudo aplicar la plantilla');
    }
  };

  // Vista Previa de la Tienda
  const handleOpenPreview = () => {
    const url = selectedCampaignId === 'base' ? '/' : `/?preview=${encodeURIComponent(selectedCampaignId)}`;
    window.open(url, '_blank');
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border/20">
        <div>
          <h1 className="font-display text-2xl font-light uppercase tracking-wider text-content">
            Constructor de Portada (Home)
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Personalizá la estructura, bloques y contenido de la portada base o de cada campaña activa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            className="flex items-center gap-1.5"
            title="Abrir vista previa de la portada en nueva pestaña"
          >
            <FiEye size={14} />
            <span>Ver Vista Previa</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <FiLayout size={14} />
            <span>Aplicar Plantilla</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenEdit(null)}
            className="flex items-center gap-1.5"
          >
            <FiPlus size={14} />
            <span>Agregar Bloque</span>
          </Button>
        </div>
      </div>

      {/* Selector de Campaña a Gestionar */}
      <div className="p-4 rounded-xl border border-brand-border/25 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="campaign-select" className="text-xs uppercase tracking-widest text-content font-medium whitespace-nowrap">
            Gestionar Portada de:
          </label>
          <select
            id="campaign-select"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none min-w-[240px]"
          >
            <option value="base">Portada Base (Sin Campaña Activa)</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                Campaña: {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>

        {selectedCampaign && (
          <div className="flex items-center gap-2 text-xs text-content-secondary">
            <span className="text-[10px] uppercase tracking-wider text-mauve font-medium">Estado:</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-brand-border/30 text-content">
              {selectedCampaign.status}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-mauve font-medium ml-2">Tema:</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-brand-border/30 text-content">
              {selectedCampaign.theme || 'neutro'}
            </span>
          </div>
        )}
      </div>

      {/* Lista de Secciones Configuradas */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-content-secondary">
            Cargando bloques de la portada...
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-brand-border/40 bg-surface/30">
            <FiSliders className="mx-auto text-3xl text-mauve mb-3" />
            <h3 className="font-display text-base uppercase tracking-wider text-content mb-1">
              No hay bloques configurados
            </h3>
            <p className="text-xs text-content-secondary mb-5 max-w-sm mx-auto">
              Podés aplicar una plantilla sugerida o agregar bloques manualmente.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setIsTemplateModalOpen(true)}>
              Aplicar Plantilla Sugerida
            </Button>
          </div>
        ) : (
          sections.map((section, idx) => {
            const conf = section.config || {};
            const typeLabel = SECTION_TYPE_LABELS[section.type] || section.type;

            return (
              <div
                key={section.id || idx}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  section.enabled
                    ? 'bg-surface border-brand-border/25 hover:border-brand-border/50'
                    : 'bg-canvas/50 border-brand-border/15 opacity-60'
                }`}
              >
                {/* Info del Bloque */}
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-canvas border border-brand-border/20 text-mauve">
                    #{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-content">
                        {typeLabel}
                      </span>
                      {!section.enabled && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300">
                          Desactivado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-content-secondary mt-0.5 line-clamp-1">
                      {conf.headline || conf.title || conf.subtitle || 'Configuración predeterminada'}
                    </p>
                  </div>
                </div>

                {/* Acciones de Orden, Edición y Estado */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Botones de Orden */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1.5 rounded hover:bg-surface-elevated text-content-muted hover:text-content disabled:opacity-20 transition-colors"
                    title="Subir bloque"
                    aria-label="Subir bloque"
                  >
                    <FiArrowUp size={15} />
                  </button>

                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1.5 rounded hover:bg-surface-elevated text-content-muted hover:text-content disabled:opacity-20 transition-colors"
                    title="Bajar bloque"
                    aria-label="Bajar bloque"
                  >
                    <FiArrowDown size={15} />
                  </button>

                  <div className="w-px h-4 bg-brand-border/30 mx-1" />

                  {/* Switch Activar/Desactivar */}
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(section)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      section.enabled
                        ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
                        : 'border-brand-border/30 bg-surface-elevated text-content-muted hover:text-content'
                    }`}
                  >
                    {section.enabled ? 'Activo' : 'Inactivo'}
                  </button>

                  {/* Editar */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(section)}
                    className="p-1.5 rounded hover:bg-surface-elevated text-content-secondary hover:text-content transition-colors ml-1"
                    title="Editar configuración"
                    aria-label="Editar configuración"
                  >
                    <FiEdit2 size={15} />
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => handleDelete(section.id)}
                    className="p-1.5 rounded hover:bg-red-950/60 text-content-muted hover:text-red-400 transition-colors"
                    title="Eliminar bloque"
                    aria-label="Eliminar bloque"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Crear / Editar Bloque */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-brand-border/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/20">
              <h2 className="font-display text-lg uppercase tracking-wider text-content">
                {editingSection ? 'Editar Bloque de Portada' : 'Nuevo Bloque de Portada'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-content-muted hover:text-content p-1"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                  Tipo de Bloque
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                >
                  {Object.entries(SECTION_TYPE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos condicionales según el tipo */}
              {(formData.type === 'HERO' || formData.type === 'CAMPAIGN_BANNER') && (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={formData.type === 'HERO' ? formData.headline : formData.title}
                      onChange={(e) =>
                        formData.type === 'HERO'
                          ? setFormData({ ...formData, headline: e.target.value })
                          : setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ej: BLACK FRIDAY NOCTURNA"
                      className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                      Bajada / Subtítulo
                    </label>
                    <textarea
                      rows={2}
                      value={formData.type === 'HERO' ? formData.subheadline : formData.subtitle}
                      onChange={(e) =>
                        formData.type === 'HERO'
                          ? setFormData({ ...formData, subheadline: e.target.value })
                          : setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="Descripción clara de los beneficios de la campaña"
                      className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                        Texto del Botón (CTA)
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        placeholder="Ej: Ver Ofertas"
                        className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                        Enlace del Botón
                      </label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        placeholder="/ofertas"
                        className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'PRODUCT_GRID' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                        Título de la Grilla
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Destacados con Descuento"
                        className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                        Cantidad Máxima
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="24"
                        value={formData.limit}
                        onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                        className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                      Filtro de Productos
                    </label>
                    <select
                      value={formData.filter}
                      onChange={(e) => setFormData({ ...formData, filter: e.target.value })}
                      className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                    >
                      <option value="campaign">Solo productos incluidos en esta campaña</option>
                      <option value="all">Todos los productos destacados</option>
                    </select>
                  </div>
                </>
              )}

              {formData.type === 'COUNTDOWN' && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-content-secondary mb-1">
                    Título de la Cuenta Regresiva
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: La campaña finaliza en:"
                    className="w-full bg-canvas border border-brand-border/30 rounded-lg px-3 py-2 text-xs text-content focus:border-mauve focus:outline-none"
                  />
                  <p className="text-[11px] text-content-muted mt-1">
                    El tiempo se calcula automáticamente según la fecha de fin de la campaña.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="section-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded border-brand-border/30 text-mauve focus:ring-mauve"
                />
                <label htmlFor="section-enabled" className="text-xs text-content select-none">
                  Mostrar este bloque en la tienda (Habilitado)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border/20">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  {editingSection ? 'Guardar Cambios' : 'Crear Bloque'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Aplicar Plantilla Sugerida */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-brand-border/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/20">
              <h2 className="font-display text-base uppercase tracking-wider text-content">
                Aplicar Plantilla Sugerida
              </h2>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-content-muted hover:text-content p-1"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-content-secondary leading-relaxed">
              Seleccioná un esquema predeterminado para poblar los bloques de esta portada con un solo clic.
            </p>

            <div className="space-y-2">
              {TEMPLATE_OPTIONS.map((tmpl) => (
                <label
                  key={tmpl.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplateKey === tmpl.key
                      ? 'bg-surface-elevated border-mauve text-content'
                      : 'border-brand-border/25 hover:border-brand-border/50 text-content-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name="templateKey"
                    value={tmpl.key}
                    checked={selectedTemplateKey === tmpl.key}
                    onChange={(e) => setSelectedTemplateKey(e.target.value)}
                    className="text-mauve focus:ring-mauve"
                  />
                  <span className="text-xs font-medium">{tmpl.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border/20">
              <Button variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleApplyTemplate}>
                Aplicar Plantilla
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
    </div>
  );
};

export default PortadaPage;
