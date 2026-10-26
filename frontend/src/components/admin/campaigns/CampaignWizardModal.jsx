import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiStar,
  FiLayers,
} from 'react-icons/fi';
import { ARGENTINE_CAMPAIGN_PRESETS } from './CampaignPresets';
import PromotionBuilder from './PromotionBuilder';

const STEPS = [
  { id: 1, title: 'Datos y Fechas' },
  { id: 2, title: 'Promociones y Reglas' },
  { id: 3, title: 'Condiciones' },
  { id: 4, title: 'Resumen y Confirmación' },
];

const CampaignWizardModal = ({
  isOpen,
  onClose,
  onSave,
  campaign = null,
  categories = [],
  products = [],
  collections = [],
  tags = [],
  priceHistory = [],
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'DRAFT',
    startsAt: '',
    endsAt: '',
    priority: 0,
    headline: '',
    subheadline: '',
    description: '',
    bannerUrl: '',
    bannerImage: '',
    theme: 'neutro',
    announcementText: '',
    announcementLink: '',
    conditionsText: '',
    showCountdown: false,
    landingEnabled: true,
    seoTitle: '',
    seoDescription: '',
    active: true,
    promotions: [],
  });

  const [dateError, setDateError] = useState('');
  const [confirmActivation, setConfirmActivation] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        slug: campaign.slug || '',
        status: campaign.status || 'DRAFT',
        startsAt: campaign.startsAt ? new Date(campaign.startsAt).toISOString().split('T')[0] : '',
        endsAt: campaign.endsAt ? new Date(campaign.endsAt).toISOString().split('T')[0] : '',
        priority: campaign.priority || 0,
        headline: campaign.headline || '',
        subheadline: campaign.subheadline || '',
        description: campaign.description || '',
        bannerUrl: campaign.bannerUrl || '',
        bannerImage: campaign.bannerImage || campaign.bannerUrl || '',
        theme: campaign.theme || 'neutro',
        announcementText: campaign.announcementText || '',
        announcementLink: campaign.announcementLink || '',
        conditionsText: campaign.conditionsText || '',
        showCountdown: Boolean(campaign.showCountdown),
        landingEnabled: campaign.landingEnabled !== false,
        seoTitle: campaign.seoTitle || '',
        seoDescription: campaign.seoDescription || '',
        active: campaign.active !== false,
        promotions: Array.isArray(campaign.promotions) ? campaign.promotions : [],
      });
      setCurrentStep(1);
    } else {
      setFormData({
        name: '',
        slug: '',
        status: 'DRAFT',
        startsAt: '',
        endsAt: '',
        priority: 0,
        headline: '',
        subheadline: '',
        description: '',
        bannerUrl: '',
        bannerImage: '',
        theme: 'neutro',
        announcementText: '',
        announcementLink: '',
        conditionsText: '',
        showCountdown: false,
        landingEnabled: true,
        seoTitle: '',
        seoDescription: '',
        active: true,
        promotions: [
          {
            name: '15% OFF en Línea Seleccionada',
            kind: 'PERCENT',
            value: 15,
            minQuantity: null,
            minOrderAmount: null,
            maxDiscountAmount: null,
            stackable: false,
            targets: [{ targetType: 'ALL', targetId: null, excluded: false }],
          },
        ],
      });
      setCurrentStep(1);
    }
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let start = new Date(today);
    let end = new Date(today);

    if (preset.month !== null) {
      start.setMonth(preset.month);
      start.setDate(15);
      if (start < today) {
        start.setFullYear(currentYear + 1);
      }
    } else {
      start.setDate(today.getDate() + 2);
    }

    end = new Date(start);
    end.setDate(start.getDate() + (preset.durationDays || 7));

    setFormData((prev) => ({
      ...prev,
      name: preset.suggestedName,
      headline: preset.headline,
      description: preset.description,
      theme: preset.theme || 'neutro',
      showCountdown: Boolean(preset.showCountdown),
      landingEnabled: preset.landingEnabled !== false,
      announcementText: `⚡ ${preset.suggestedName}: ${preset.headline}`,
      priority: preset.priority,
      startsAt: start.toISOString().split('T')[0],
      endsAt: end.toISOString().split('T')[0],
      promotions: [
        {
          name: `${preset.suggestedPromoValue ? `${preset.suggestedPromoValue}% OFF` : 'Promoción'} ${preset.name}`,
          kind: preset.suggestedPromoKind,
          value: preset.suggestedPromoValue,
          buyQuantity: 2,
          payQuantity: 1,
          stackable: false,
          targets: [{ targetType: 'ALL', targetId: null, excluded: false }],
        },
      ],
    }));
  };

  const validateDates = () => {
    if (formData.startsAt && formData.endsAt) {
      const s = new Date(formData.startsAt).getTime();
      const e = new Date(formData.endsAt).getTime();
      if (e <= s) {
        setDateError('La fecha de fin debe ser posterior a la fecha de inicio');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return;
      if (!validateDates()) return;
    }
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (finalStatus = null) => {
    const payload = {
      ...formData,
      status: finalStatus || formData.status,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface border border-brand-border/30 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-content my-auto">
        {/* Header con Stepper */}
        <div className="p-4 sm:p-6 border-b border-brand-border/20 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-mauve font-semibold">
                Asistente de Marketing
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-content">
                {campaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-content-secondary hover:text-content p-1.5 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Stepper horizontal */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex items-center space-x-2 text-left focus:outline-none"
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === step.id
                        ? 'bg-mauve text-canvas ring-2 ring-mauve/40'
                        : currentStep > step.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-elevated text-content-muted'
                    }`}
                  >
                    {currentStep > step.id ? <FiCheck size={14} /> : step.id}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-medium ${
                      currentStep === step.id ? 'text-content' : 'text-content-muted'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-emerald-600' : 'bg-brand-border/25'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body interactivo con scroll interno */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* PASO 1: Datos y Fechas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Presets típicos de Argentina */}
              <div className="p-4 rounded-xl bg-surface-elevated/40 border border-brand-border/25">
                <div className="flex items-center space-x-2 mb-2">
                  <FiStar className="text-mauve" size={15} />
                  <span className="text-xs font-semibold text-content uppercase tracking-wider">
                    Presets de Fechas Comerciales en Argentina
                  </span>
                </div>
                <p className="text-xs text-content-secondary mb-3">
                  Hacé clic en un evento para autocompletar nombre sugerido, títulos, prioridad y fechas:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ARGENTINE_CAMPAIGN_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-canvas border border-brand-border/30 hover:border-mauve hover:bg-surface-elevated text-content-secondary hover:text-content transition-colors flex items-center space-x-1.5"
                    >
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
                <div className="p-2.5 bg-amber-950/20 border border-amber-800/30 rounded-lg text-amber-300 text-[11px] flex items-start gap-2">
                  <FiInfo className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                  <span>
                    <strong>Texto sugerido editable:</strong> Recordá que los títulos y descripciones deben ser comprobables según las leyes de lealtad comercial (evitá frases como 'precios récord' o 'los más bajos del año').
                  </span>
                </div>
              </div>

              {/* Formulario de datos básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Nombre de la Campaña *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Hot Sale Nocturna"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Slug Identificador (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ej: hot-sale (opcional)"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Titular Principal (Headline)
                </label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Ej: Las mejores ofertas del año en placer y seducción"
                  className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Subtítulo / Bajada de Campaña
                </label>
                <input
                  type="text"
                  value={formData.subheadline || ''}
                  onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                  placeholder="Ej: Hasta 35% OFF en piezas seleccionadas y envíos 100% discretos."
                  className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Tema Visual (Preset)
                  </label>
                  <select
                    value={formData.theme || 'neutro'}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  >
                    <option value="black-friday">Black Friday (Obsidiana y Dorado)</option>
                    <option value="cyber-sale">Cyber / Hot Sale (Cyan & Electric Blue)</option>
                    <option value="dia-de-la-madre">Día de la Madre (Rose Gold & Seda)</option>
                    <option value="san-valentin">San Valentín (Crimson & Pasión)</option>
                    <option value="navidad">Navidad (Verde Profundo & Dorado)</option>
                    <option value="liquidacion">Liquidación / Outlet (Fuego & Naranja)</option>
                    <option value="neutro">Neutro de Marca (Paleta Nocturna)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Barra de Anuncios Superior
                  </label>
                  <input
                    type="text"
                    value={formData.announcementText || ''}
                    onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                    placeholder="Ej: 🌸 Especial Día de la Madre: 15% OFF"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center space-x-2 text-xs text-content cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showCountdown}
                    onChange={(e) => setFormData({ ...formData, showCountdown: e.target.checked })}
                    className="rounded border-brand-border/30 text-mauve focus:ring-mauve"
                  />
                  <span>Mostrar cuenta regresiva a fecha fin</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-content cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.landingEnabled}
                    onChange={(e) => setFormData({ ...formData, landingEnabled: e.target.checked })}
                    className="rounded border-brand-border/30 text-mauve focus:ring-mauve"
                  />
                  <span>Habilitar página dedicada (/campanas/:slug)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Bases y Condiciones Legales de la Promoción
                </label>
                <textarea
                  rows="2"
                  value={formData.conditionsText || ''}
                  onChange={(e) => setFormData({ ...formData, conditionsText: e.target.value })}
                  placeholder="Condiciones específicas, vigencia, límite de stock y alcance en Córdoba."
                  className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Descripción o Condiciones Generales
                </label>
                <textarea
                  rows="2"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles de la campaña, alcance de envíos y términos."
                  className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                />
              </div>

              {/* Selector de Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1 flex items-center space-x-1">
                    <FiCalendar size={13} className="text-mauve" />
                    <span>Fecha y Hora de Inicio</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startsAt || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, startsAt: e.target.value });
                      setDateError('');
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1 flex items-center space-x-1">
                    <FiCalendar size={13} className="text-mauve" />
                    <span>Fecha y Hora de Fin</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endsAt || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, endsAt: e.target.value });
                      setDateError('');
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Prioridad de Campaña (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              </div>

              {dateError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
                  <FiAlertTriangle size={15} />
                  <span>{dateError}</span>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Constructor de Promociones */}
          {currentStep === 2 && (
            <PromotionBuilder
              promotions={formData.promotions}
              onChange={(updatedPromos) => setFormData({ ...formData, promotions: updatedPromos })}
              categories={categories}
              products={products}
              collections={collections}
              tags={tags}
              priceHistory={priceHistory}
            />
          )}

          {/* PASO 3: Condiciones Generales */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-elevated/40 border border-brand-border/25 space-y-4">
                <h4 className="text-xs font-semibold text-content uppercase tracking-wider flex items-center space-x-2">
                  <FiLayers className="text-mauve" />
                  <span>Condiciones de Visualización y Banner</span>
                </h4>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    URL de Imagen o Banner Promocional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.bannerUrl || ''}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    placeholder="https://... o /images/brand/banner.webp"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  />
                  <p className="text-[11px] text-content-muted mt-1">
                    Cumplimiento de marca: sin desnudez explícita ni contenido explícito; se conserva el aviso +18.
                  </p>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Estado Inicial de la Campaña
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['DRAFT', 'SCHEDULED', 'ACTIVE'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: st })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.status === st
                            ? 'bg-brand/40 border-mauve text-content ring-1 ring-mauve/40'
                            : 'bg-canvas/60 border-brand-border/25 text-content-secondary hover:text-content'
                        }`}
                      >
                        <span className="text-xs font-bold block mb-0.5">
                          {st === 'DRAFT' ? 'Borrador (DRAFT)' : st === 'SCHEDULED' ? 'Programada' : 'Activa (En vivo)'}
                        </span>
                        <span className="text-[11px] text-content-muted leading-tight block">
                          {st === 'DRAFT'
                            ? 'No se aplicará a los clientes todavía.'
                            : st === 'SCHEDULED'
                            ? 'Se activará automáticamente al llegar la fecha de inicio.'
                            : 'Vigente inmediatamente para todos los compradores.'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner de Honestidad Legal */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-start space-x-3">
                <FiCheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={16} />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-300">
                    Regla de Honestidad Comercial y Verificación de Precios
                  </p>
                  <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                    El motor de precios validará cada producto contra el historial real de los últimos 30 días. Si un producto no registra precio de lista comprobable, se exhibirá con precio final transparente sin precio tachado ficticio.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Resumen y Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-surface-elevated/40 border border-brand-border/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-mauve font-semibold uppercase tracking-wider">
                      Resumen de la Campaña
                    </span>
                    <h3 className="text-lg font-bold text-content">{formData.name}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                      formData.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : formData.status === 'SCHEDULED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-content-muted block">Vigencia:</span>
                    <span className="text-content font-medium">
                      {formData.startsAt || 'Inmediato'} al {formData.endsAt || 'Sin fecha de fin'}
                    </span>
                  </div>
                  <div>
                    <span className="text-content-muted block">Prioridad:</span>
                    <span className="text-content font-medium">{formData.priority}</span>
                  </div>
                  {formData.headline && (
                    <div className="sm:col-span-2">
                      <span className="text-content-muted block">Titular:</span>
                      <span className="text-content font-medium">{formData.headline}</span>
                    </div>
                  )}
                </div>

                {/* Lista de Promociones a crear */}
                <div className="pt-3 border-t border-brand-border/20">
                  <h4 className="text-xs font-semibold text-content mb-2">
                    Promociones Asociadas ({formData.promotions?.length || 0}):
                  </h4>
                  <div className="space-y-2">
                    {(formData.promotions || []).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-canvas rounded-lg border border-brand-border/25 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-content">{p.name}</span>
                          <span className="text-[11px] text-content-muted block">
                            Tipo: {p.kind} {p.value ? `(${p.value}${p.kind === 'PERCENT' ? '%' : '$'})` : ''}
                          </span>
                        </div>
                        <span className="text-[10px] bg-brand/50 text-content border border-mauve/30 px-2 py-0.5 rounded">
                          {p.targets?.[0]?.targetType || 'ALL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {confirmActivation && (
                <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl text-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiAlertTriangle className="text-amber-400" size={18} />
                    <span>¿Confirmás la activación inmediata de esta campaña en la tienda?</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setConfirmActivation(false)}
                      className="px-2.5 py-1 bg-surface-elevated text-content rounded-md hover:bg-surface"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit('ACTIVE')}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-500"
                    >
                      Sí, Activar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con Navegación y Acciones */}
        <div className="p-4 sm:p-5 border-t border-brand-border/20 bg-surface-elevated/40 flex items-center justify-between flex-shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-canvas border border-brand-border/30 text-content-secondary hover:text-content hover:bg-surface transition-colors"
              >
                <FiChevronLeft size={14} />
                <span>Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-elevated transition-colors"
            >
              Cancelar
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-content hover:bg-brand/90 transition-colors shadow-sm"
              >
                <span>Siguiente</span>
                <FiChevronRight size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-elevated border border-brand-border/40 text-content hover:bg-surface transition-colors"
                >
                  Guardar como Borrador
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.status === 'ACTIVE' || confirmActivation) {
                      handleSubmit('ACTIVE');
                    } else {
                      setConfirmActivation(true);
                    }
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-md"
                >
                  Activar Campaña
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizardModal;
