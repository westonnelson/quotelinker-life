
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define the gtag function globally
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: { [key: string]: any }
    ) => void;
  }
}

/**
 * Hook that tracks page views when the route changes
 */
export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track page view if gtag is available
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
      console.log('Google Analytics page view tracked:', location.pathname);
    }
  }, [location]);
};
