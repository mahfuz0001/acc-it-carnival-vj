"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Tenant } from "@/lib/tenant"

interface TenantContextType {
  tenant: Tenant | null
  customizations: Record<string, any>
  isLoading: boolean
  updateCustomization: (section: string, key: string, value: any) => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({
  children,
  initialTenant,
  initialCustomizations,
}: {
  children: React.ReactNode
  initialTenant: Tenant | null
  initialCustomizations: Record<string, any>
}) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant)
  const [customizations, setCustomizations] = useState(initialCustomizations)
  const [isLoading, setIsLoading] = useState(false)

  const updateCustomization = (section: string, key: string, value: any) => {
    setCustomizations((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  // Apply tenant theme to CSS variables
  useEffect(() => {
    if (tenant) {
      const root = document.documentElement
      root.style.setProperty("--tenant-primary", tenant.primary_color)
      root.style.setProperty("--tenant-secondary", tenant.secondary_color)
      root.style.setProperty("--tenant-accent", tenant.accent_color)
      root.style.setProperty("--tenant-background", tenant.background_color)
      root.style.setProperty("--tenant-text", tenant.text_color)

      // Apply custom CSS if available
      if (tenant.custom_css) {
        const styleElement = document.getElementById("tenant-custom-css")
        if (styleElement) {
          styleElement.innerHTML = tenant.custom_css
        } else {
          const style = document.createElement("style")
          style.id = "tenant-custom-css"
          style.innerHTML = tenant.custom_css
          document.head.appendChild(style)
        }
      }

      // Update favicon if available
      if (tenant.favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (favicon) {
          favicon.href = tenant.favicon_url
        }
      }
    }
  }, [tenant])

  return (
    <TenantContext.Provider
      value={{
        tenant,
        customizations,
        isLoading,
        updateCustomization,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
