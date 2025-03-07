import { Plugin } from "../../types/plugin";

const ResendPlugin: Plugin = {
  metadata: {
    id: "resend",
    name: "Resend",
    description: "Resend plugin for Zero Email",
    version: "1.0.0",
    author: "Zero Email",
  },
  options: {
    apiKey: {
      value: "",
      field: {
        type: "password",
        label: "Resend API Key",
        description: "Your Resend API key from the Resend dashboard",
        required: true,
        validation: {
          pattern: "^re_[a-zA-Z0-9_]{32,}$",
          message: "Please enter a valid Resend API key starting with 're_'",
        },
      },
    },
  },
};

export default ResendPlugin;
