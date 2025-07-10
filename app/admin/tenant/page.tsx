"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTenant } from "@/components/tenant-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Palette, Settings, Upload, Eye } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function TenantManagement() {
  const { tenant, customizations, updateCustomization } = useTenant()
  const [isLoading, setIsLoading] = useState(false)
  const [tenantData, setTenantData] = useState({
    name: tenant?.name || "",
    description: tenant?.description || "",
    logo_url: tenant?.logo_url || "",
    favicon_url: tenant?.favicon_url || "",
    primary_color: tenant?.primary_color || "#F7374F",
    secondary_color: tenant?.secondary_color || "#B267FF",
    accent_color: tenant?.accent_color || "#6ba348",
    background_color: tenant?.background_color || "#0a0612",
    text_color: tenant?.text_color || "#FFFFFF",
    custom_css: tenant?.custom_css || "",
  })

  const [contentData, setContentData] = useState({
    hero_title: customizations?.hero?.title || "Welcome to Our Event",
    hero_subtitle: customizations?.hero?.subtitle || "Join us for an amazing experience",
    hero_description: customizations?.hero?.description || "Description of your event",
    about_title: customizations?.about?.title || "About Our Event",
    about_content: customizations?.about?.content || "Tell people about your event",
    footer_text: customizations?.footer?.text || "© 2024 Your Event. All rights reserved.",
  })

  const updateTenant = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("tenants")
        .update({
          ...tenantData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenant.id)

      if (error) throw error

      toast.success("Tenant settings updated successfully!")

      // Reload page to apply changes
      window.location.reload()
    } catch (error) {
      console.error("Error updating tenant:", error)
      toast.error("Failed to update tenant settings")
    } finally {
      setIsLoading(false)
    }
  }

  const updateContent = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      // Update hero section
      await supabase.from("tenant_customizations").upsert(
        [
          { tenant_id: tenant.id, section: "hero", key: "title", value: contentData.hero_title },
          { tenant_id: tenant.id, section: "hero", key: "subtitle", value: contentData.hero_subtitle },
          { tenant_id: tenant.id, section: "hero", key: "description", value: contentData.hero_description },
          { tenant_id: tenant.id, section: "about", key: "title", value: contentData.about_title },
          { tenant_id: tenant.id, section: "about", key: "content", value: contentData.about_content },
          { tenant_id: tenant.id, section: "footer", key: "text", value: contentData.footer_text },
        ],
        { onConflict: "tenant_id,section,key" },
      )

      toast.success("Content updated successfully!")
    } catch (error) {
      console.error("Error updating content:", error)
      toast.error("Failed to update content")
    } finally {
      setIsLoading(false)
    }
  }

  const ColorPicker = ({
    color,
    onChange,
    label,
  }: { color: string; onChange: (color: string) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
            <div className="w-4 h-4 rounded border mr-2" style={{ backgroundColor: color }} />
            {color}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={color} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )

  if (!tenant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Tenant Not Found</h2>
            <p className="text-muted-foreground">Unable to load tenant configuration.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--tenant-background)] to-[#1a1f4a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tenant Management</h1>
          <p className="text-gray-300">Customize your event platform</p>
          <Badge className="mt-2" style={{ backgroundColor: tenant.primary_color }}>
            {tenant.subdomain}.yourdomain.com
          </Badge>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#556492]/20">
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white">Brand Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Organization Name</Label>
                      <Input
                        value={tenantData.name}
                        onChange={(e) => setTenantData((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-[#0a0612] border-[#556492] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={tenantData.description}
                        onChange={(e) => setTenantData((prev) => ({ ...prev, description: e.target.value }))}
                        className="bg-[#0a0612] border-[#556492] text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ColorPicker
                      color={tenantData.primary_color}
                      onChange={(color) => setTenantData((prev) => ({ ...prev, primary_color: color }))}
                      label="Primary Color"
                    />
                    <ColorPicker
                      color={tenantData.secondary_color}
                      onChange={(color) => setTenantData((prev) => ({ ...prev, secondary_color: color }))}
                      label="Secondary Color"
                    />
                    <ColorPicker
                      color={tenantData.accent_color}
                      onChange={(color) => setTenantData((prev) => ({ ...prev, accent_color: color }))}
                      label="Accent Color"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Custom CSS</Label>
                  <Textarea
                    value={tenantData.custom_css}
                    onChange={(e) => setTenantData((prev) => ({ ...prev, custom_css: e.target.value }))}
                    className="bg-[#0a0612] border-[#556492] text-white font-mono"
                    rows={6}
                    placeholder="/* Add your custom CSS here */"
                  />
                </div>

                <Button
                  onClick={updateTenant}
                  disabled={isLoading}
                  className="bg-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/90"
                >
                  {isLoading ? "Updating..." : "Update Branding"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white">Content Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Hero Section</h3>
                  <div>
                    <Label className="text-white">Hero Title</Label>
                    <Input
                      value={contentData.hero_title}
                      onChange={(e) => setContentData((prev) => ({ ...prev, hero_title: e.target.value }))}
                      className="bg-[#0a0612] border-[#556492] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Hero Subtitle</Label>
                    <Input
                      value={contentData.hero_subtitle}
                      onChange={(e) => setContentData((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
                      className="bg-[#0a0612] border-[#556492] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Hero Description</Label>
                    <Textarea
                      value={contentData.hero_description}
                      onChange={(e) => setContentData((prev) => ({ ...prev, hero_description: e.target.value }))}
                      className="bg-[#0a0612] border-[#556492] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">About Section</h3>
                  <div>
                    <Label className="text-white">About Title</Label>
                    <Input
                      value={contentData.about_title}
                      onChange={(e) => setContentData((prev) => ({ ...prev, about_title: e.target.value }))}
                      className="bg-[#0a0612] border-[#556492] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">About Content</Label>
                    <Textarea
                      value={contentData.about_content}
                      onChange={(e) => setContentData((prev) => ({ ...prev, about_content: e.target.value }))}
                      className="bg-[#0a0612] border-[#556492] text-white"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Footer</h3>
                  <div>
                    <Label className="text-white">Footer Text</Label>
                    <Input
                      value={contentData.footer_text}
                      onChange={(e) => setContentData((prev) => ({ ...prev, footer_text: e.target.value }))}
                      className="bg-[#0a0612] border-[#556492] text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={updateContent}
                  disabled={isLoading}
                  className="bg-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/90"
                >
                  {isLoading ? "Updating..." : "Update Content"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white">Media Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-white">Logo URL</Label>
                  <Input
                    value={tenantData.logo_url}
                    onChange={(e) => setTenantData((prev) => ({ ...prev, logo_url: e.target.value }))}
                    className="bg-[#0a0612] border-[#556492] text-white"
                    placeholder="https://example.com/logo.png"
                  />
                  {tenantData.logo_url && (
                    <div className="mt-2">
                      <img
                        src={tenantData.logo_url || "/placeholder.svg"}
                        alt="Logo preview"
                        className="h-16 object-contain bg-white rounded p-2"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white">Favicon URL</Label>
                  <Input
                    value={tenantData.favicon_url}
                    onChange={(e) => setTenantData((prev) => ({ ...prev, favicon_url: e.target.value }))}
                    className="bg-[#0a0612] border-[#556492] text-white"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>

                <Button
                  onClick={updateTenant}
                  disabled={isLoading}
                  className="bg-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/90"
                >
                  {isLoading ? "Updating..." : "Update Media"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: tenantData.background_color,
                      borderColor: tenantData.primary_color + "40",
                    }}
                  >
                    <h2 className="text-2xl font-bold mb-2" style={{ color: tenantData.text_color }}>
                      {contentData.hero_title}
                    </h2>
                    <h3 className="text-lg mb-2" style={{ color: tenantData.primary_color }}>
                      {contentData.hero_subtitle}
                    </h3>
                    <p style={{ color: tenantData.text_color + "CC" }}>{contentData.hero_description}</p>
                    <div className="mt-4 flex gap-2">
                      <div
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: tenantData.primary_color }}
                      >
                        Primary Button
                      </div>
                      <div
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: tenantData.secondary_color }}
                      >
                        Secondary Button
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    This is a preview of how your customizations will look. Save changes to see them live on your site.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
