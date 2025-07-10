import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RegistrationConfirmationEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
}

export const RegistrationConfirmationEmail = ({
  userName,
  eventName,
  eventDate,
}: RegistrationConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your registration for {eventName} has been confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://your-domain.com/logo.png"
            width="50"
            height="50"
            alt="ACC IT Carnival"
            style={logo}
          />
          <Heading style={h1}>Registration Confirmed!</Heading>
        </Section>

        <Section style={content}>
          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>
            Great news! Your registration for <strong>{eventName}</strong> has
            been confirmed.
          </Text>

          <Section style={eventDetails}>
            <Text style={detailsTitle}>Event Details:</Text>
            <Text style={details}>
              <strong>Event:</strong> {eventName}
              <br />
              <strong>Date:</strong> {new Date(eventDate).toLocaleDateString()}
              <br />
              <strong>Status:</strong> Confirmed
            </Text>
          </Section>

          <Text style={text}>
            We're excited to have you participate in ACC IT Carnival 4.0! Make
            sure to check your profile for any updates and prepare for an
            amazing experience.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href="https://your-domain.com/profile">
              View My Profile
            </Link>
          </Section>

          <Text style={text}>
            If you have any questions, feel free to contact us at{" "}
            <Link href="mailto:support@accitcarnival.com" style={link}>
              support@accitcarnival.com
            </Link>
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © 2025 Adamjee Cantonment College IT Carnival 4.0. All rights
            reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#131943",
  fontFamily: "Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#F7374F",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "20px 0",
  textAlign: "center" as const,
};

const content = {
  backgroundColor: "#556492",
  borderRadius: "8px",
  padding: "32px",
  margin: "20px 0",
};

const text = {
  color: "#EBEBEB",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const eventDetails = {
  backgroundColor: "#7683A4",
  borderRadius: "6px",
  padding: "20px",
  margin: "20px 0",
};

const detailsTitle = {
  color: "#F7374F",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const details = {
  color: "#EBEBEB",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#F7374F",
  borderRadius: "6px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#F7374F",
  textDecoration: "underline",
};

const footer = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const footerText = {
  color: "#D4D4D6",
  fontSize: "12px",
  margin: "0",
};
