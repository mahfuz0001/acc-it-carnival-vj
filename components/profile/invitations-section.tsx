"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { respondToInvitation } from "@/lib/actions/team-invitations"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Loader2 } from "lucide-react"

type Invitation = {
  id: string
  team_id: string
  inviter_id: string
  invitee_email: string
  status: string
  invited_at: string
  expires_at: string
  teams: {
    id: string
    name: string
    events: {
      id: string
      name: string
    }
  }
  inviter: {
    id: string
    email: string
    user_metadata: {
      full_name?: string
    }
  }
}

interface InvitationsSectionProps {
  invitations: Invitation[]
}

export function InvitationsSection({ invitations }: InvitationsSectionProps) {
  const { toast } = useToast()
  const [pendingInvitations, setPendingInvitations] = useState<Record<string, boolean>>({})

  if (!invitations.length) {
    return null
  }

  async function handleRespond(formData: FormData) {
    const invitationId = formData.get("invitationId") as string
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: true }))

    try {
      const result = await respondToInvitation(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        const response = formData.get("response") as string
        toast({
          title: response === "accepted" ? "Invitation Accepted" : "Invitation Declined",
          description:
            response === "accepted" ? "You have successfully joined the team." : "You have declined the invitation.",
        })

        // Remove the invitation from the list
        setPendingInvitations((prev) => {
          const updated = { ...prev }
          delete updated[invitationId]
          return updated
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPendingInvitations((prev) => ({ ...prev, [invitationId]: false }))
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Invitations</CardTitle>
        <CardDescription>Pending invitations to join teams</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{invitation.teams.name}</h3>
                <Badge variant="outline">{invitation.teams.events.name}</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                Invited by {invitation.inviter.user_metadata?.full_name || invitation.inviter.email}
              </p>

              <p className="text-xs text-muted-foreground flex items-center mb-4">
                <Clock className="mr-1 h-3 w-3" />
                Invited {new Date(invitation.invited_at).toLocaleDateString()} • Expires{" "}
                {new Date(invitation.expires_at).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                <form action={handleRespond} className="flex-1">
                  <input type="hidden" name="invitationId" value={invitation.id} />
                  <input type="hidden" name="response" value="declined" />
                  <Button
                    variant="outline"
                    type="submit"
                    className="w-full"
                    disabled={!!pendingInvitations[invitation.id]}
                  >
                    {pendingInvitations[invitation.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
                  </Button>
                </form>

                <form action={handleRespond} className="flex-1">
                  <input type="hidden" name="invitationId" value={invitation.id} />
                  <input type="hidden" name="response" value="accepted" />
                  <Button type="submit" className="w-full" disabled={!!pendingInvitations[invitation.id]}>
                    {pendingInvitations[invitation.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
