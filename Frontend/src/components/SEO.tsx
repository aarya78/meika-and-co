import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_NAME = "Meika & Co";
const SITE_URL = "https://meika-and-co.example"; // replace with real domain
const DEFAULT_IMAGE = "/og-image.svg";

type SchemaObj = Record<string, unknown>;

interface SEOProps {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  canonical?: string;
  children?: React.ReactNode;
  robots?: string;
  schema?: SchemaObj | SchemaObj[];
}

export default function SEO({
  title,
  description,
  pathname,
  image,
  canonical,
  children,
  robots = "index,follow",
  schema,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = canonical ?? (pathname ? `${SITE_URL}${pathname}` : SITE_URL);
  const img = image ?? DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {children}

      {/* JSON-LD schemas */}
      {(() => {
        const organization = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": SITE_NAME,
          "url": SITE_URL,
          "logo": `${SITE_URL}/og-image.svg`,
        };

        const website = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": SITE_URL,
          "name": SITE_NAME,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${SITE_URL}/?s={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        };

        const baseSchemas: SchemaObj[] = [organization, website];

        const extra = Array.isArray(schema) ? schema : schema ? [schema] : [];

        return [...baseSchemas, ...extra].map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ));
      })()}
    </Helmet>
  );
}
