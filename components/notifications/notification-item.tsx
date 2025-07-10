import { TeamInvitationNotification } from "./team-invitation-notification"

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    data: any
    read: boolean
  }
  onAction: () => void
}

export function NotificationItem({ notification, onAction }: NotificationItemProps) {
  // Render different notification types
  switch (notification.type) {
    case "team_invitation":
      return <TeamInvitationNotification notification={notification} onAction={onAction} />

    // Add more notification types as needed

    default:
      return (
        <div className="p-4 border rounded-lg mb-2">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        </div>
      )
  }
}
