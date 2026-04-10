type SeoPayload = {
  title: string;
  description: string;
  path?: string;
  robots?: string;
};

const setMeta = (selector: string, attribute: 'content' | 'href', value: string) => {
  if (typeof document === 'undefined') return;
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

export const applySeo = ({ title, description, path = '/', robots = 'index,follow' }: SeoPayload) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const canonicalUrl = new URL(path, window.location.origin).toString();

  document.title = title;
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[name="robots"]', 'content', robots);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', canonicalUrl);
};
