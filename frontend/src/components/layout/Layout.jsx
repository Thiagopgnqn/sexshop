import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AgeGateModal, { isAgeVerifiedInStorage } from './AgeGateModal';
import ErrorBoundary from './ErrorBoundary';
import { initMetaPixel } from '../../utils/metaPixel';

const Layout = () => {
  const [ageVerified, setAgeVerified] = useState(() => isAgeVerifiedInStorage());
  const location = useLocation();

  useEffect(() => {
    if (ageVerified) {
      initMetaPixel();
    }
  }, [ageVerified]);

  if (!ageVerified) {
    return (
      <div className="min-h-screen bg-canvas text-content">
        <AgeGateModal onConfirm={() => setAgeVerified(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-content selection:bg-brand selection:text-content">
      <Header />
      <main className="flex-grow">
        <ErrorBoundary resetKey={location.pathname + location.search}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
