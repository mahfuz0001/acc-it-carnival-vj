import type React from "react"
import { Toaster } from "@/components/ui/sonner"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
import { PageTransition } from "@/components/page-transition"
import { TenantProvider } from "@/components/tenant-provider"
import { getCurrentTenant, getTenantCustomizations } from "@/lib/tenant"
import "./globals.css"
import { PWAInstall } from "@/components/pwa-install"

export async function generateMetadata() {
  const tenant = await getCurrentTenant()

  return {
    title: tenant?.name || "Event Management Platform",
    description: tenant?.description || "Professional event management platform",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: tenant?.name || "Event Platform",
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = await getCurrentTenant()
  const customizations = tenant ? await getTenantCustomizations(tenant.id) : {}

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {tenant?.favicon_url && <link rel="icon" href={tenant.favicon_url} />}
          <style>{`
            :root {
              --tenant-primary: ${tenant?.primary_color || "#F7374F"};
              --tenant-secondary: ${tenant?.secondary_color || "#B267FF"};
              --tenant-accent: ${tenant?.accent_color || "#6ba348"};
              --tenant-background: ${tenant?.background_color || "#0a0612"};
              --tenant-text: ${tenant?.text_color || "#FFFFFF"};
            }
          `}</style>
          {tenant?.custom_css && <style id="tenant-custom-css">{tenant.custom_css}</style>}
        </head>
        <body className="min-h-screen font-sans antialiased">
          <TenantProvider initialTenant={tenant} initialCustomizations={customizations}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <ErrorBoundary>
                <PageTransition>
                  <main className="flex-1">
                    <Header />
                    {children}
                  </main>
                </PageTransition>
                <Footer />
                <Toaster position="bottom-right" />
                <OfflineIndicator />
                <PWAInstall />
              </ErrorBoundary>
            </ThemeProvider>
          </TenantProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
