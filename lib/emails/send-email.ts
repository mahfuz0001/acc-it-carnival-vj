import { Resend } from "resend"
import TeamInvitationEmail from "@/components/emails/team-invitation"

const resend = new Resend(process.env.RESEND_API_KEY)

type TeamInvitationEmailProps = {
  to: string
  invitationId: string
  teamName: string
  eventName: string
  inviterName: string
}

export async function sendTeamInvitationEmail({
  to,
  invitationId,
  teamName,
  eventName,
  inviterName,
}: TeamInvitationEmailProps) {
  const { error } = await resend.emails.send({
    from: "IT Carnival <no-reply@itcarnival.tech>",
    to: [to],
    subject: `You're invited to join team ${teamName} for ${eventName}`,
    react: TeamInvitationEmail({
      invitationId,
      teamName,
      eventName,
      inviterName,
      invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/teams/invitation/${invitationId}`,
    }),
  })

  if (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email")
  }

  return { success: true }
}
