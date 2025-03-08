import { EXTENSION_POINTS } from "@/constants/extension-points";
import { Plugin, PluginDataStorage } from "../../types/plugin";
import React, { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAudiences } from "./actions";
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

const AudiencesList = memo(
  React.forwardRef<HTMLDivElement, { storage?: PluginDataStorage }>((props, ref) => {
    const [audiences, setAudiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAudience, setSelectedAudience] = useState("");

    useEffect(() => {
      const fetchAudiences = async () => {
        setLoading(true);
        const { data, error: fetchError } = await getAudiences();
        setAudiences(data);
        setError(fetchError);
        setLoading(false);
      };

      fetchAudiences();
    }, []);

    return (
      <div className="flex items-center">
        <div className="text-muted-foreground w-20 flex-shrink-0 pr-3 text-right text-[1rem] font-[600] opacity-50 md:w-24">
          Audience
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <select
            className="text-md relative ml-5 w-full bg-transparent placeholder:text-[#616161] placeholder:opacity-50 focus:outline-none"
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
          >
            <option value="" disabled>
              Select an audience
            </option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }),
);

const SendButton = memo(
  React.forwardRef<HTMLButtonElement, { storage?: PluginDataStorage }>((props, ref) => {
    return (
      <Button
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          // handleSendEmail(e);
          alert("sending to mail list");
        }}
        type="button"
        {...props}
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
      location: EXTENSION_POINTS.COMPOSE.RECIPIENTS,
      component: createStorageComponent(AudiencesList),
    },
    {
      location: EXTENSION_POINTS.COMPOSE.SEND_BUTTON,
      component: createStorageComponent(SendButton),
    },
  ],
};

export default ResendPlugin;
