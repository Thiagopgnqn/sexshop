import { useEffect } from 'react';
import themeConfig from '../config/theme';

const setOrCreateMeta = (attribute, nameOrProperty, content) => {
  if (!content) return;
  let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
} = {}) => {
  const brandName = themeConfig.brand.name;

  useEffect(() => {
    // Title
    if (title) {
      document.title = title.includes(brandName) ? title : `${title} | ${brandName}`;
    }

    // Standard SEO
    if (description) {
      setOrCreateMeta('name', 'description', description);
    }
    if (keywords) {
      setOrCreateMeta('name', 'keywords', keywords);
    }

    // Open Graph
    const currentUrl = url || window.location.href;
    setOrCreateMeta('property', 'og:title', title || document.title);
    if (description) setOrCreateMeta('property', 'og:description', description);
    if (image) setOrCreateMeta('property', 'og:image', image);
    setOrCreateMeta('property', 'og:url', currentUrl);
    setOrCreateMeta('property', 'og:type', type);

    // Twitter
    setOrCreateMeta('name', 'twitter:title', title || document.title);
    if (description) setOrCreateMeta('name', 'twitter:description', description);
    if (image) setOrCreateMeta('name', 'twitter:image', image);

    // Dynamic JSON-LD Structured Data
    let scriptTag = null;
    if (structuredData) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify(structuredData);
      scriptTag.setAttribute('data-dynamic-seo', 'true');
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, keywords, image, url, type, structuredData, brandName]);
};

export default useSEO;
