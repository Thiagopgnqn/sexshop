import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiCalendar,
  FiCopy,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiArchive,
  FiPlay,
  FiPause,
  FiLayers,
  FiAlertTriangle,
  FiRefreshCw,
  FiEye,
  FiGlobe,
  FiLayout,
  FiShare2,
} from 'react-icons/fi';
import client from '../../api/client';
import CampaignWizardModal from '../../components/admin/campaigns/CampaignWizardModal';

// Lazy loaded to exclude qrcode bundle from initial campaign views
const CampaignShareModal = React.lazy(() => import('../../components/admin/campaigns/CampaignShareModal'));

const STATUS_FILTERS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ACTIVE', label: 'Activas' },
  { id: 'SCHEDULED', label: 'Programadas' },
  { id: 'DRAFT', label: 'Borradores' },
  { id: 'ENDED', label: 'Finalizadas' },
  { id: 'ARCHIVED', label: 'Archivadas' },
];

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [shareCampaign, setShareCampaign] = useState(null);

  // Data for wizard
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);

  // Modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Confirmation dialogs
  const [confirmAction, setConfirmAction] = useState(null); // { type, campaignId, title, message }

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await client.get('/campaigns', {
        params: { status: statusFilter, search },
      });
      setCampaigns(res.data || []);
    } catch (err) {
      console.error('Error cargando campañas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [catsRes, prodsRes, collsRes, tagsRes, histRes] = await Promise.all([
        client.get('/categories?flat=true').catch(() => ({ data: [] })),
        client.get('/products?limit=100').catch(() => ({ data: { products: [] } })),
        client.get('/collections').catch(() => ({ data: [] })),
        client.get('/tags').catch(() => ({ data: [] })),
        client.get('/audit/price-history?limit=200').catch(() => ({ data: { items: [] } })),
      ]);
      setCategories(catsRes.data || []);
      setProducts(prodsRes.data?.products || prodsRes.data || []);
      setCollections(collsRes.data || []);
      setTags(tagsRes.data || []);
      setPriceHistory(histRes.data?.items || []);
    } catch (err) {
      console.warn('Error cargando datos auxiliares para campañas:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  const handleSaveCampaign = async (payload) => {
    try {
      if (editingCampaign) {
        await client.put(`/campaigns/${editingCampaign.id}`, payload);
      } else {
        await client.post('/campaigns', payload);
      }
      setWizardOpen(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la campaña');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await client.post(`/campaigns/${id}/duplicate`);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al duplicar la campaña');
    }
  };

  const handleEndCampaign = async (id) => {
    try {
      await client.patch(`/campaigns/${id}/end`);
      setConfirmAction(null);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al finalizar la campaña');
    }
  };

  const handleArchiveCampaign = async (id) => {
    try {
      await client.patch(`/campaigns/${id}/archive`);
      setConfirmAction(null);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al archivar la campaña');
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      await client.delete(`/campaigns/${id}`);
      setConfirmAction(null);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar la campaña');
    }
  };

  const getStatusBadge = (effectiveStatus) => {
    switch (effectiveStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
            <FiCheckCircle size={12} />
            <span>ACTIVA</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/40">
            <FiClock size={12} />
            <span>PROGRAMADA</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <span>BORRADOR</span>
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/40">
            <span>FINALIZADA</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-stone-900 text-stone-400 border border-stone-800">
            <FiArchive size={12} />
            <span>ARCHIVADA</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-content">
            Campañas y Promociones
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Gestión integral de eventos comerciales, descuentos automáticos y reglas del motor de precios.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Link
            to="/admin/portada"
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-surface-elevated text-content rounded-xl text-xs font-semibold hover:bg-brand transition-colors border border-brand-border/30"
          >
            <FiLayout size={15} />
            <span>Constructor de Portada</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setEditingCampaign(null);
              setWizardOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand text-content rounded-xl text-xs font-bold hover:bg-brand/90 transition-colors shadow-sm border border-mauve/40"
          >
            <FiPlus size={16} />
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-brand-border/20">
        {/* Chips de estado */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                statusFilter === f.id
                  ? 'bg-brand text-content border border-mauve/40 shadow-xs'
                  : 'bg-surface-elevated text-content-secondary hover:text-content'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-3 text-content-muted" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o título..."
            className="w-full bg-canvas border border-brand-border/30 rounded-lg pl-9 pr-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
          />
        </div>
      </div>

      {/* Listado de Campañas */}
      {loading ? (
        <div className="text-center py-16 text-content-muted">
          <FiRefreshCw className="animate-spin h-6 w-6 mx-auto mb-2 text-mauve" />
          <p className="text-xs">Cargando campañas...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-brand-border/20 p-8">
          <FiLayers className="mx-auto text-mauve h-10 w-10 mb-3 opacity-50" />
          <h3 className="text-base font-semibold text-content">No se encontraron campañas</h3>
          <p className="text-xs text-content-secondary mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Probá ajustando los filtros de búsqueda.'
              : 'Creá tu primera campaña con el asistente de marketing.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-surface rounded-xl border border-brand-border/25 p-5 flex flex-col justify-between hover:border-brand-border/50 transition-all shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-content-muted font-mono block">
                      Prioridad: {camp.priority || 0}
                    </span>
                    <h3 className="text-base font-bold text-content truncate" title={camp.name}>
                      {camp.name}
                    </h3>
                  </div>
                  {getStatusBadge(camp.effectiveStatus || camp.status)}
                </div>

                {camp.headline && (
                  <p className="text-xs text-mauve font-medium line-clamp-1">{camp.headline}</p>
                )}

                {camp.description && (
                  <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>
                )}

                {/* Fechas */}
                <div className="p-2.5 rounded-lg bg-canvas border border-brand-border/20 text-[11px] text-content-secondary space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-content-muted">Inicio:</span>
                    <span className="font-medium text-content">
                      {camp.startsAt ? new Date(camp.startsAt).toLocaleDateString('es-AR') : 'Inmediato'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-content-muted">Fin:</span>
                    <span className="font-medium text-content">
                      {camp.endsAt ? new Date(camp.endsAt).toLocaleDateString('es-AR') : 'Sin fin'}
                    </span>
                  </div>
                </div>

                {/* Promociones asociadas */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-content-muted">Promociones asociadas:</span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-elevated font-bold text-content border border-brand-border/30">
                    {camp.promotions?.length || 0}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 mt-4 border-t border-brand-border/20 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCampaign(camp);
                      setWizardOpen(true);
                    }}
                    className="p-2 rounded-lg bg-surface-elevated text-content-secondary hover:text-content hover:bg-brand transition-colors text-xs"
                    title="Editar campaña"
                  >
                    <FiEdit2 size={14} />
                  </button>

                  <a
                    href={`/?preview=${encodeURIComponent(camp.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-surface-elevated text-content-secondary hover:text-content hover:bg-brand transition-colors text-xs"
                    title="Ver vista previa de la portada con esta campaña"
                  >
                    <FiEye size={14} />
                  </a>

                  {camp.slug && (
                    <a
                      href={`/campanas/${camp.slug}?preview=${encodeURIComponent(camp.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-elevated text-content-secondary hover:text-content hover:bg-brand transition-colors text-xs"
                      title="Ver página dedicada de la campaña"
                    >
                      <FiGlobe size={14} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setShareCampaign(camp)}
                    className="p-2 rounded-lg bg-surface-elevated text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors text-xs flex items-center gap-1.5"
                    title="Compartir con enlaces UTM y Código QR offline"
                  >
                    <FiShare2 size={14} />
                    <span className="hidden sm:inline font-medium">Compartir & QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(camp.id)}
                    className="p-2 rounded-lg bg-surface-elevated text-content-secondary hover:text-content hover:bg-brand transition-colors text-xs"
                    title="Duplicar campaña"
                  >
                    <FiCopy size={14} />
                  </button>

                  {camp.effectiveStatus !== 'ENDED' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          type: 'END',
                          campaignId: camp.id,
                          title: 'Finalizar Campaña',
                          message: `¿Estás seguro de que querés finalizar inmediatamente la campaña "${camp.name}"? Los descuentos dejarán de aplicar.`,
                        })
                      }
                      className="p-2 rounded-lg bg-surface-elevated text-content-secondary hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-xs"
                      title="Finalizar campaña"
                    >
                      <FiPause size={14} />
                    </button>
                  )}

                  {camp.effectiveStatus !== 'ARCHIVED' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          type: 'ARCHIVE',
                          campaignId: camp.id,
                          title: 'Archivar Campaña',
                          message: `¿Archivar la campaña "${camp.name}"?`,
                        })
                      }
                      className="p-2 rounded-lg bg-surface-elevated text-content-secondary hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs"
                      title="Archivar campaña"
                    >
                      <FiArchive size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      type: 'DELETE',
                      campaignId: camp.id,
                      title: 'Eliminar Campaña',
                      message: `¿Eliminar permanentemente la campaña "${camp.name}" y sus promociones asociadas?`,
                    })
                  }
                  className="p-2 rounded-lg text-content-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors text-xs"
                  title="Eliminar campaña"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Compartir UTM y QR */}
      {shareCampaign && (
        <React.Suspense fallback={null}>
          <CampaignShareModal
            campaign={shareCampaign}
            isOpen={Boolean(shareCampaign)}
            onClose={() => setShareCampaign(null)}
          />
        </React.Suspense>
      )}

      {/* Modal Asistente en Pasos */}
      {wizardOpen && (
        <CampaignWizardModal
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setEditingCampaign(null);
          }}
          onSave={handleSaveCampaign}
          campaign={editingCampaign}
          categories={categories}
          products={products}
          collections={collections}
          tags={tags}
          priceHistory={priceHistory}
        />
      )}

      {/* Modal de Confirmación para Acciones Críticas */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-surface border border-brand-border/40 rounded-xl max-w-md w-full p-6 text-content space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400">
              <FiAlertTriangle size={24} />
              <h3 className="text-base font-bold font-display text-content">
                {confirmAction.title}
              </h3>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              {confirmAction.message}
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-surface-elevated hover:bg-surface text-content rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction.type === 'END') handleEndCampaign(confirmAction.campaignId);
                  else if (confirmAction.type === 'ARCHIVE') handleArchiveCampaign(confirmAction.campaignId);
                  else if (confirmAction.type === 'DELETE') handleDeleteCampaign(confirmAction.campaignId);
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
