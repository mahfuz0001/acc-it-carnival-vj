import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      subdomain,
      name,
      description,
      primary_color = "#F7374F",
      secondary_color = "#B267FF",
      accent_color = "#6ba348",
    } = body

    if (!subdomain || !name) {
      return NextResponse.json({ error: "Subdomain and name are required" }, { status: 400 })
    }

    // Check if subdomain is available
    const { data: existingTenant } = await supabase.from("tenants").select("id").eq("subdomain", subdomain).single()

    if (existingTenant) {
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 409 })
    }

    // Create new tenant
    const { data: tenant, error } = await supabase
      .from("tenants")
      .insert({
        subdomain,
        name,
        description,
        primary_color,
        secondary_color,
        accent_color,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating tenant:", error)
      return NextResponse.json({ error: "Failed to create tenant" }, { status: 500 })
    }

    // Create default customizations
    const defaultCustomizations = [
      { tenant_id: tenant.id, section: "hero", key: "title", value: `Welcome to ${name}` },
      { tenant_id: tenant.id, section: "hero", key: "subtitle", value: name },
      {
        tenant_id: tenant.id,
        section: "hero",
        key: "description",
        value: description || "Join us for an amazing experience",
      },
      { tenant_id: tenant.id, section: "about", key: "title", value: `About ${name}` },
      { tenant_id: tenant.id, section: "about", key: "content", value: "Tell people about your event here." },
      { tenant_id: tenant.id, section: "footer", key: "text", value: `© 2024 ${name}. All rights reserved.` },
    ]

    await supabase.from("tenant_customizations").insert(defaultCustomizations)

    return NextResponse.json({ success: true, tenant })
  } catch (error) {
    console.error("Error in tenant creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tenants, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tenants:", error)
      return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 })
    }

    return NextResponse.json({ tenants })
  } catch (error) {
    console.error("Error in tenant fetch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
