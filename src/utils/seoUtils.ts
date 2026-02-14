export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
}

export const DEFAULT_SEO: SEOConfig = {
  title: "Rebooked Solutions - Buy & Sell Textbooks",
  description:
    "Find affordable textbooks for university and school. Buy and sell used textbooks with confidence on South Africa's trusted marketplace.",
  image: "https://cdn.builder.io/api/v1/image/assets%2Fd496663337e74740910037e73ef37db4%2Fa4d94e95c03244a89c08a0582a9856f0?format=webp&width=800",
  url: "https://rebookedsolutions.co.za",
  type: "website",
  keywords: [
    "textbooks",
    "university",
    "school",
    "buy",
    "sell",
    "south africa",
    "education",
  ],
};

export const generatePageSEO = (config: Partial<SEOConfig>): SEOConfig => {
  return {
    ...DEFAULT_SEO,
    ...config,
    title: config.title
      ? `${config.title} | Rebooked Solutions`
      : DEFAULT_SEO.title,
  };
};

export const generateBookSEO = (book: {
  title: string;
  author: string;
  price: number;
  description?: string;
  imageUrl?: string;
}): SEOConfig => {
  return generatePageSEO({
    title: `${book.title} by ${book.author}`,
    description: `Buy "${book.title}" by ${book.author} for R${book.price.toLocaleString()}. ${book.description ? book.description.substring(0, 100) + "..." : "Available on Rebooked Solutions."}`,
    image: book.imageUrl,
    type: "product",
    keywords: ["textbook", book.title, book.author, "university", "school"],
  });
};

export const generateStructuredData = (
  config: SEOConfig & { price?: number; author?: string },
) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": config.type === "product" ? "Product" : "WebSite",
    name: config.title,
    description: config.description,
    url: config.url,
    image: config.image,
  };

  if (config.type === "product" && config.price && config.author) {
    return {
      ...baseStructuredData,
      "@type": "Product",
      author: {
        "@type": "Person",
        name: config.author,
      },
      offers: {
        "@type": "Offer",
        price: config.price,
        priceCurrency: "ZAR",
        availability: "https://schema.org/InStock",
      },
    };
  }

  return baseStructuredData;
};

export const updateMetaTags = (config: SEOConfig) => {
  // Update document title
  document.title = config.title;

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property = false) => {
    const selector = property
      ? `meta[property="${name}"]`
      : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;

    if (!meta) {
      meta = document.createElement("meta");
      if (property) {
        meta.setAttribute("property", name);
      } else {
        meta.setAttribute("name", name);
      }
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", content);
  };

  // Standard meta tags
  updateMetaTag("description", config.description);
  if (config.keywords) {
    updateMetaTag("keywords", config.keywords.join(", "));
  }

  // Open Graph tags
  updateMetaTag("og:title", config.title, true);
  updateMetaTag("og:description", config.description, true);
  updateMetaTag("og:type", config.type || "website", true);
  updateMetaTag("og:site_name", "Rebooked Solutions", true);
  if (config.url) updateMetaTag("og:url", config.url, true);
  if (config.image) updateMetaTag("og:image", config.image, true);

  // Twitter Card tags
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", config.title);
  updateMetaTag("twitter:description", config.description);
  if (config.image) updateMetaTag("twitter:image", config.image);

  // Update canonical URL and Hreflang
  const updateLinkTag = (rel: string, href: string, attributes: Record<string, string> = {}) => {
    let selector = `link[rel="${rel}"]`;
    if (attributes.hreflang) {
      selector += `[hreflang="${attributes.hreflang}"]`;
    }

    let element = document.querySelector(selector) as HTMLLinkElement;
    if (!element) {
      element = document.createElement("link");
      element.setAttribute("rel", rel);
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      document.head.appendChild(element);
    }
    element.setAttribute("href", href);
  };

  if (config.url) {
    updateLinkTag("canonical", config.url);
  }

  updateLinkTag("alternate", "https://rebookedsolutions.co.za", { hreflang: "en-ZA" });
  updateLinkTag("alternate", "https://rebookedsolutions.co.za", { hreflang: "x-default" });
};
