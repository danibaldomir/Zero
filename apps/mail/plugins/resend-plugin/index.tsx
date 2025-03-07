import { EXTENSION_POINTS } from "@/constants/extension-points";
import { Plugin, PluginDataStorage } from "../../types/plugin";
import React, { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

let pluginInstance: Plugin;

const createStorageComponent = (Component: React.ComponentType<any>): React.ReactElement => {
  const StorageComponent = memo((props: any) => {
    const [storage, setStorage] = useState<PluginDataStorage>();

    useEffect(() => {
      setStorage(pluginInstance?.storage);
    }, []);

    return <Component {...props} storage={storage} />;
  });

  return <StorageComponent />;
};

const SendButton = memo(
  React.forwardRef((props, ref) => {
    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
          // handleSendEmail(e);
          alert("sending to mail list");
        }}
        type="button"
      >
        <ArrowUp className="h-4 w-4" />
        <span className="whitespace-nowrap">Send to Mail List</span>
      </Button>
    );
  }),
);

const ResendPlugin: Plugin = {
  metadata: {
    id: "resend",
    name: "Resend",
    description: "Resend plugin for Zero Email",
    version: "1.0.0",
    author: "Zero Email",
    tags: ["Resend", "Email", "Zero", "Tag"],
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
  uiExtensions: [
    {
      location: EXTENSION_POINTS.COMPOSE.SEND_BUTTON,
      component: createStorageComponent(SendButton),
    },
  ],
};

export default ResendPlugin;
