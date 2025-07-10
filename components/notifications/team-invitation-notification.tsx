"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { respondToInvitation } from "@/lib/actions/team-invitations"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface TeamInvitationNotificationProps {
  notification: {
    id: string
    data: {
      invitationId: string
      teamId: string
      teamName: string
      eventName: string
    }
  }
  onAction: () => void
}

export function TeamInvitationNotification({ notification, onAction }: TeamInvitationNotificationProps) {
  const { toast } = useToast()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  async function handleAccept() {
    setIsAccepting(true)

    const formData = new FormData()
    formData.append("invitationId", notification.data.invitationId)
    formData.append("response", "accepted")

    try {
      const result = await respondToInvitation(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Invitation Accepted",
          description: "You have successfully joined the team.",
        })
        onAction()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  async function handleDecline() {
    setIsDeclining(true)

    const formData = new FormData()
    formData.append("invitationId", notification.data.invitationId)
    formData.append("response", "declined")

    try {
      const result = await respondToInvitation(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Invitation Declined",
          description: "You have declined the invitation.",
        })
        onAction()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeclining(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-2">
        <p>
          You've been invited to join team "{notification.data.teamName}" for event "{notification.data.eventName}".
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDecline} disabled={isAccepting || isDeclining}>
          {isDeclining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
        </Button>
        <Button size="sm" onClick={handleAccept} disabled={isAccepting || isDeclining}>
          {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href={`/teams/invitation/${notification.data.invitationId}`}>View</a>
        </Button>
      </div>
    </Card>
  )
}
