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

interface SubmissionConfirmationEmailProps {
  userName: string;
  eventName: string;
  submissionLink: string;
}

export const SubmissionConfirmationEmail = ({
  userName,
  eventName,
  submissionLink,
}: SubmissionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your submission for {eventName} has been received!</Preview>
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
          <Heading style={h1}>Submission Received!</Heading>
        </Section>

        <Section style={content}>
          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>
            Excellent! Your submission for <strong>{eventName}</strong> has been
            successfully received.
          </Text>

          <Section style={submissionDetails}>
            <Text style={detailsTitle}>Submission Details:</Text>
            <Text style={details}>
              <strong>Event:</strong> {eventName}
              <br />
              <strong>Submitted:</strong> {new Date().toLocaleDateString()}
              <br />
              <strong>Status:</strong> Under Review
            </Text>
          </Section>

          <Text style={text}>
            Your submission is now under review by our judges. Results will be
            announced after the evaluation process is complete.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={submissionLink}>
              View Submission
            </Link>
          </Section>

          <Text style={text}>
            Thank you for participating in ACC IT Carnival 4.0! We appreciate
            your effort and creativity.
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

const submissionDetails = {
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

const footer = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const footerText = {
  color: "#D4D4D6",
  fontSize: "12px",
  margin: "0",
};
