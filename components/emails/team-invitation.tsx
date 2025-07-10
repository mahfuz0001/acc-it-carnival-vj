import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface TeamInvitationEmailProps {
  invitationId: string
  teamName: string
  eventName: string
  inviterName: string
  invitationUrl: string
}

export default function TeamInvitationEmail({
  invitationId,
  teamName,
  eventName,
  inviterName,
  invitationUrl,
}: TeamInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You've been invited to join team {teamName} for {eventName}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg p-8 mx-auto my-10 max-w-xl">
            <Heading className="text-2xl font-bold text-center text-gray-800 mb-6">Team Invitation</Heading>

            <Text className="text-gray-700 mb-4">Hello,</Text>

            <Text className="text-gray-700 mb-4">
              <strong>{inviterName}</strong> has invited you to join their team <strong>{teamName}</strong> for the
              event <strong>{eventName}</strong> at IT Carnival.
            </Text>

            <Section className="text-center my-8">
              <Button className="bg-blue-600 text-white font-medium py-3 px-6 rounded-md" href={invitationUrl}>
                View Invitation
              </Button>
            </Section>

            <Text className="text-gray-700 mb-4">
              If you already have an account, you'll be able to accept or decline this invitation. If you don't have an
              account yet, you'll need to create one first.
            </Text>

            <Text className="text-gray-700 mb-4">This invitation will expire in 7 days.</Text>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-gray-500 text-sm text-center">
              If you didn't expect this invitation, you can safely ignore this email.
            </Text>

            <Text className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} IT Carnival. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
