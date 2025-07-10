import { supabase } from "@/lib/supabase"
import { headers } from "next/headers"

export interface Tenant {
  id: string
  subdomain: string
  name: string
  description?: string
  logo_url?: string
  favicon_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  custom_css?: string
  custom_domain?: string
  is_active: boolean
  plan_type: string
  created_at: string
  updated_at: string
}

export interface TenantCustomization {
  id: string
  tenant_id: string
  section: string
  key: string
  value: any
}

export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const headersList = await headers()
    const host = headersList.get("host") || ""

    // Extract subdomain from host
    let subdomain = extractSubdomain(host)

    if (!subdomain) {
      // Default tenant for main domain
      subdomain = "acc-it-carnival"
    }

    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("subdomain", subdomain)
      .eq("is_active", true)
      .single()

    if (error || !tenant) {
      console.error("Tenant not found:", error)
      return null
    }

    return tenant
  } catch (error) {
    console.error("Error getting current tenant:", error)
    return null
  }
}

export function extractSubdomain(host: string): string {
  // Remove port if present
  const hostname = host.split(":")[0]

  // Split by dots
  const parts = hostname.split(".")

  // If localhost or IP, return default
  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return "acc-it-carnival"
  }

  // If custom domain, check database
  // For now, assume subdomain is first part if more than 2 parts
  if (parts.length > 2) {
    return parts[0]
  }

  return "acc-it-carnival"
}

export async function getTenantCustomizations(tenantId: string): Promise<Record<string, any>> {
  try {
    const { data: customizations, error } = await supabase
      .from("tenant_customizations")
      .select("*")
      .eq("tenant_id", tenantId)

    if (error) {
      console.error("Error fetching tenant customizations:", error)
      return {}
    }

    // Group by section and key
    const grouped: Record<string, any> = {}
    customizations?.forEach((custom) => {
      if (!grouped[custom.section]) {
        grouped[custom.section] = {}
      }
      grouped[custom.section][custom.key] = custom.value
    })

    return grouped
  } catch (error) {
    console.error("Error getting tenant customizations:", error)
    return {}
  }
}

export async function updateTenantCustomization(tenantId: string, section: string, key: string, value: any) {
  try {
    const { data, error } = await supabase.from("tenant_customizations").upsert(
      {
        tenant_id: tenantId,
        section,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "tenant_id,section,key",
      },
    )

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error updating tenant customization:", error)
    throw error
  }
}
