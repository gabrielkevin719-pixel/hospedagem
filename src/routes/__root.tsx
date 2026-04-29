import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pesquisa de Satisfação Stanley 2026 – Campanha Oficial" },
      { name: "description", content: "Responda à nossa pesquisa oficial de 2026 e verifique sua elegibilidade para resgatar um Copo Quencher 1.18L. Oferta limitada por região enquanto durarem os est" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Pesquisa de Satisfação Stanley 2026 – Campanha Oficial" },
      { property: "og:description", content: "Responda à nossa pesquisa oficial de 2026 e verifique sua elegibilidade para resgatar um Copo Quencher 1.18L. Oferta limitada por região enquanto durarem os est" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Pesquisa de Satisfação Stanley 2026 – Campanha Oficial" },
      { name: "twitter:description", content: "Responda à nossa pesquisa oficial de 2026 e verifique sua elegibilidade para resgatar um Copo Quencher 1.18L. Oferta limitada por região enquanto durarem os est" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/iTODGn9dsqZoeAoUfDIJpZwiX1l1/social-images/social-1777414413100-KarolG_2026_Desktop_PDP_1x1-04.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/iTODGn9dsqZoeAoUfDIJpZwiX1l1/social-images/social-1777414413100-KarolG_2026_Desktop_PDP_1x1-04.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        children: `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('D7NONKJC77UDMCD1DDL0');
  ttq.page();
}(window, document, 'ttq');`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
