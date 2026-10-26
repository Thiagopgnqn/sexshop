import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiArrowRight } from 'react-icons/fi';
import client from '../../api/client';
import { getCampaignTheme } from '../../pricing-engine/index.js';

const STORAGE_KEY = 'nocturna_dismissed_announcement';

const AnnouncementBar = () => {
  const [campaign, setCampaign] = useState(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkActiveCampaign = async () => {
      try {
        const res = await client.get('/campaigns/active');
        const active = res.data;

        if (isMounted && active && active.announcementText) {
          const dismissedId = localStorage.getItem(STORAGE_KEY);
          if (dismissedId !== active.id) {
            setCampaign(active);
            setDismissed(false);
          }
        }
      } catch {
        // Fallback silencioso si no hay campaña
      }
    };

    checkActiveCampaign();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismiss = () => {
    if (campaign?.id) {
      localStorage.setItem(STORAGE_KEY, campaign.id);
    }
    setDismissed(true);
  };

  if (dismissed || !campaign || !campaign.announcementText) {
    return null;
  }

  const theme = getCampaignTheme(campaign.theme);

  return (
    <aside
      aria-label="Aviso de promoción destacada"
      className={`relative z-40 w-full py-2 px-4 text-center transition-all duration-300 border-b ${theme.borderAccent} bg-surface-elevated/95 backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-[13px]">
        {/* Espaciador izquierdo para centrar el mensaje */}
        <div className="w-6 hidden sm:block flex-shrink-0" />

        <div className="flex-1 flex items-center justify-center flex-wrap gap-2 text-content">
          <span className="font-medium tracking-wide">
            {campaign.announcementText}
          </span>

          {campaign.announcementLink && (
            <Link
              to={campaign.announcementLink}
              className={`inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ${theme.accentText}`}
            >
              <span>Ver más</span>
              <FiArrowRight size={12} />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded text-content-muted hover:text-content hover:bg-surface transition-colors flex-shrink-0"
          title="Ocultar aviso de campaña"
          aria-label="Ocultar aviso de campaña"
        >
          <FiX size={15} />
        </button>
      </div>
    </aside>
  );
};

export default AnnouncementBar;
