import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  FiX,
  FiCopy,
  FiCheck,
  FiDownload,
  FiShare2,
  FiExternalLink,
  FiInstagram,
  FiMail,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';

export default function CampaignShareModal({ campaign, isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('instagram');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [customMedium, setCustomMedium] = useState('');
  const canvasRef = useRef(null);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://tiendanocturna.com.ar';
  const campaignSlug = campaign?.slug || '';
  const basePath = `/campanas/${campaignSlug}`;
  const baseFullUrl = `${origin}${basePath}`;

  const channels = [
    {
      id: 'instagram',
      name: 'Instagram (Bio / Historias)',
      icon: FiInstagram,
      color: 'text-pink-400',
      utm_source: 'instagram',
      utm_medium: 'social',
      description: 'Ideal para colocar en el enlace del perfil o stickers de historias.',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp (Chats / Difusión)',
      icon: FaWhatsapp,
      color: 'text-emerald-400',
      utm_source: 'whatsapp',
      utm_medium: 'chat',
      description: 'Para compartir en listas de difusión o mensajes directos.',
    },
    {
      id: 'meta_ads',
      name: 'Meta Ads (Facebook / Instagram Ads)',
      icon: FaFacebook,
      color: 'text-blue-400',
      utm_source: 'facebook',
      utm_medium: 'cpc',
      description: 'Para configurar como URL de destino en tus anuncios pagos.',
    },
    {
      id: 'newsletter',
      name: 'Email / Newsletter',
      icon: FiMail,
      color: 'text-amber-400',
      utm_source: 'newsletter',
      utm_medium: 'email',
      description: 'Para incluir en tus campañas de email marketing periódicas.',
    },
    {
      id: 'direct',
      name: 'Enlace directo (Sin UTM)',
      icon: FiExternalLink,
      color: 'text-purple-400',
      utm_source: null,
      utm_medium: null,
      description: 'Enlace limpio a la landing page de la campaña.',
    },
  ];

  const buildUrl = (source, medium) => {
    if (!campaignSlug) return baseFullUrl;
    if (!source && !medium) return baseFullUrl;
    const params = new URLSearchParams();
    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    params.set('utm_campaign', campaignSlug);
    return `${baseFullUrl}?${params.toString()}`;
  };

  const getActiveUrl = () => {
    if (selectedChannel === 'custom') {
      return buildUrl(customSource || 'personalizado', customMedium || 'canal');
    }
    const ch = channels.find((c) => c.id === selectedChannel);
    if (!ch) return baseFullUrl;
    return buildUrl(ch.utm_source, ch.utm_medium);
  };

  const activeUrl = getActiveUrl();

  // Generate QR code whenever activeUrl changes
  useEffect(() => {
    if (!isOpen || !campaign || !activeUrl) return;
    let active = true;
    QRCode.toDataURL(activeUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generando QR offline:', err);
      });
    return () => {
      active = false;
    };
  }, [isOpen, campaign, activeUrl]);

  const handleCopy = async (text, key) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.error('Error al copiar:', e);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !campaign) return;
    const link = document.createElement('a');
    link.download = `QR-${campaign.slug}-${selectedChannel}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!isOpen || !campaign) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8 relative text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center border border-purple-700/50">
              <FiShare2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Compartir Campaña y Códigos QR
              </h3>
              <p className="text-xs text-neutral-400">
                Campaña:{' '}
                <span className="font-semibold text-purple-300">{campaign.name}</span>{' '}
                <span className="text-neutral-500 font-mono">({campaign.slug})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          {/* Left Column: UTM Links */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <span>Enlaces prearmados con atribución UTM</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-mono">
                1-click copy
              </span>
            </h4>

            <div className="space-y-2.5">
              {channels.map((ch) => {
                const Icon = ch.icon;
                const link = buildUrl(ch.utm_source, ch.utm_medium);
                const isSelected = selectedChannel === ch.id;

                return (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-neutral-800/80 border-purple-500/50 ring-1 ring-purple-500/30'
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedChannel(ch.id)}
                        className="flex items-center gap-2 font-medium text-xs text-left hover:text-purple-300"
                      >
                        <Icon className={`w-4 h-4 ${ch.color}`} />
                        <span className="text-white font-medium">{ch.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                            QR activo
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(link, ch.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition ${
                            copiedKey === ch.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                          }`}
                        >
                          {copiedKey === ch.id ? (
                            <>
                              <FiCheck className="w-3.5 h-3.5" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 truncate bg-neutral-950/60 p-1.5 rounded border border-neutral-800/60 select-all">
                      {link}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">{ch.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Offline QR Generator */}
          <div className="md:col-span-5 flex flex-col justify-between bg-neutral-950/50 p-5 rounded-2xl border border-neutral-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-neutral-200">
                  Código QR (Offline)
                </h4>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  100% por código
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Generado localmente en tu navegador sin enviar datos a servidores externos. Listo para imprimir en packaging, folletos o carteles en el local.
              </p>

              {/* QR Preview Box */}
              <div className="bg-white p-3 rounded-xl shadow-lg inline-block mx-auto flex flex-col items-center justify-center border border-neutral-300">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Código QR ${campaign.name}`}
                    className="w-48 h-48 object-contain rounded"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-neutral-400">
                    Generando QR...
                  </div>
                )}
                <div className="text-[10px] text-neutral-700 font-mono mt-1 text-center font-bold">
                  Tienda Nocturna • {campaign.slug}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                disabled={!qrDataUrl}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-purple-950/40 disabled:opacity-50"
              >
                <FiDownload className="w-4 h-4" />
                <span>Descargar Código QR (PNG)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(activeUrl, 'qr_url')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition"
              >
                {copiedKey === 'qr_url' ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡URL copiada!</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-3.5 h-3.5" />
                    <span>Copiar URL del QR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
          <span>
            Los pedidos realizados a través de estos enlaces registrarán automáticamente la atribución en el panel de métricas.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
