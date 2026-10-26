import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureUTM } from '../utils/utmTracker';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    captureUTM(search);
  }, [search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
