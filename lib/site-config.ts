import { Metadata } from "next";

const TITLE = "0 Email";
const DESCRIPTION =
  "Email, reimagined. Chat with your inbox using a modern, open source, and secure platform that puts you in control.";

const BASE_URL = "https://0.email";

export const siteConfig: Metadata = {
  title: {
    template: TITLE,
    default: TITLE,
    absolute: TITLE,
  },
  description: DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "0 Email",
  creator: "0 Email Team and Open Source contributors",

  category: "Productivity",
  alternates: {
    canonical: BASE_URL,
  },
  keywords: [
    "Mail",
    "Email",
    "Open Source",
    "Email Client",
    "Gmail Alternative",
    "Webmail",
    "Secure Email",
    "Email Management",
    "Email Platform",
    "Communication Tool",
    "Productivity",
    "Business Email",
    "Personal Email",
    "Mail Server",
    "Email Software",
    "Collaboration",
    "Message Management",
    "Digital Communication",
    "Email Service",
    "Web Application",
  ],
  metadataBase: new URL(BASE_URL),
};
