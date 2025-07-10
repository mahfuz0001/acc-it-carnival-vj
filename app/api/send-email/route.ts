import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { RegistrationConfirmationEmail } from "@/components/emails/registration-confirmation"
import { SubmissionConfirmationEmail } from "@/components/emails/submission-confirmation"
import { EventReminderEmail } from "@/components/emails/event-reminder"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    let emailComponent
    let subject

    switch (type) {
      case "registration_confirmation":
        emailComponent = RegistrationConfirmationEmail(data)
        subject = `Registration Confirmed - ${data.eventName}`
        break
      case "submission_confirmation":
        emailComponent = SubmissionConfirmationEmail(data)
        subject = `Submission Received - ${data.eventName}`
        break
      case "event_reminder":
        emailComponent = EventReminderEmail(data)
        subject = `Reminder: ${data.eventName} is Tomorrow!`
        break
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "ACC IT Carnival <noreply@accitcarnival.com>",
      to: [to],
      subject,
      react: emailComponent,
    })

    if (error) {
      console.error("Email sending error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: emailData })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
