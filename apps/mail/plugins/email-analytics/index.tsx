import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EXTENSION_POINTS } from "../../constants/extension-points";
import { createElement, memo, useEffect, useState } from "react";
import { Plugin, PluginDataStorage } from "../../types/plugin";
import { ChartBar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as React from "react";

interface ResponseTimeData {
  messageId: string;
  responseTime: number;
  threadId: string;
  timestamp: string;
}

const MailListAnalytics = memo(
  React.forwardRef<HTMLDivElement, { data?: any; storage?: PluginDataStorage }>((props, ref) => {
    const message = props.data?.message;
    const [responseTime, setResponseTime] = useState<number | null>(null);

    useEffect(() => {
      if (!message || !props.storage) return;

      const calculateAndStoreResponseTime = async () => {
        try {
          // Get existing response times
          const times = (await props.storage?.get<ResponseTimeData[]>("response_times")) || [];

          // Check if we already have data for this message
          const existingData = times.find((t) => t.messageId === message.id);
          if (existingData) {
            setResponseTime(existingData.responseTime);
            return;
          }

          // Calculate response time (example calculation)
          const newResponseTime = message.previousMessageTimestamp
            ? Math.floor(
                (new Date(message.timestamp).getTime() -
                  new Date(message.previousMessageTimestamp).getTime()) /
                  (1000 * 60 * 60),
              )
            : 0;

          // Store the new response time
          const newData: ResponseTimeData = {
            messageId: message.id,
            threadId: message.threadId,
            responseTime: newResponseTime,
            timestamp: new Date().toISOString(),
          };

          await props.storage?.set("response_times", [...times, newData]);
          setResponseTime(newResponseTime);
        } catch (error) {
          console.error("Error calculating response time:", error);
        }
      };

      calculateAndStoreResponseTime();
    }, [message, props.storage]);

    if (!message || responseTime === null) return null;

    return (
      <div ref={ref} className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              <span>{responseTime}h</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Average response time</TooltipContent>
        </Tooltip>
      </div>
    );
  }),
);

const MailViewAnalytics = memo(
  React.forwardRef<HTMLButtonElement, { data?: any; storage?: PluginDataStorage }>((props, ref) => {
    const email = props.data?.email;
    const [threadStats, setThreadStats] = useState<{
      avgResponseTime: number;
      totalMessages: number;
    } | null>(null);

    useEffect(() => {
      if (!email || !props.storage) return;

      const loadThreadStats = async () => {
        try {
          const times = (await props.storage?.get<ResponseTimeData[]>("response_times")) || [];
          const threadTimes = times.filter((t) => t.threadId === email.threadId);

          if (threadTimes.length > 0) {
            const avgTime =
              threadTimes.reduce((acc, curr) => acc + curr.responseTime, 0) / threadTimes.length;
            setThreadStats({
              avgResponseTime: Math.round(avgTime),
              totalMessages: threadTimes.length,
            });
          }
        } catch (error) {
          console.error("Error loading thread stats:", error);
        }
      };

      loadThreadStats();
    }, [email, props.storage]);

    if (!email) return null;

    return (
      <Button ref={ref} variant="ghost" size="sm" className="gap-2">
        <ChartBar className="h-4 w-4" />
        <span>
          {threadStats
            ? `Avg Response: ${threadStats.avgResponseTime}h (${threadStats.totalMessages} messages)`
            : "Thread Analytics"}
        </span>
      </Button>
    );
  }),
);

interface ContactData {
  email: string;
  count: number;
  lastInteraction: string;
}

const SearchAnalytics = memo(
  React.forwardRef<HTMLButtonElement, { storage?: PluginDataStorage }>((props, ref) => {
    const handleClick = async () => {
      if (!props.storage) return;

      try {
        await props.storage.set("test_write_to_db", []);

        toast.success("Contact interaction saved!");
      } catch (error) {
        console.error("Error saving contact:", error);
        toast.error("Failed to save contact interaction");
      }
    };

    return (
      <Button ref={ref} variant="ghost" size="sm" className="gap-2" onClick={handleClick}>
        <Users className="h-4 w-4" />
        <span>Top Contacts</span>
      </Button>
    );
  }),
);

// Plugin instance to store the reference
let pluginInstance: Plugin;

// Create components with storage
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

const EmailAnalyticsPlugin: Plugin = {
  metadata: {
    id: "email-analytics",
    name: "Email Analytics",
    description: "Add analytics features to your email client",
    version: "1.0.0",
    author: "Zero Email",
  },
  onActivate: async (storage) => {
    pluginInstance = EmailAnalyticsPlugin;

    const times = await storage.get<ResponseTimeData[]>("response_times");
    if (!times) {
      await storage.set("response_times", []);
    }
  },
  uiExtensions: [
    {
      location: EXTENSION_POINTS.MAIL_LIST.LIST_ITEM,
      component: createStorageComponent(MailListAnalytics),
      priority: 100,
    },
    {
      location: EXTENSION_POINTS.MAIL_VIEW.TOOLBAR,
      component: createStorageComponent(MailViewAnalytics),
      priority: 50,
    },
    {
      location: EXTENSION_POINTS.SEARCH.ACTIONS,
      component: createStorageComponent(SearchAnalytics),
      priority: 50,
    },
  ],
};

export default EmailAnalyticsPlugin;
