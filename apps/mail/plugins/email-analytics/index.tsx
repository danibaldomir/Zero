import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EXTENSION_POINTS } from "../../constants/extension-points";
import { ChartBar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plugin } from "../../types/plugin";
import * as React from "react";
import { memo } from "react";

const MailListAnalytics = memo(
  React.forwardRef<HTMLDivElement, { data?: any }>((props, ref) => {
    const message = props.data?.message;
    if (!message) return null;

    const responseTime = Math.floor(Math.random() * 24) + 1;

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
  React.forwardRef<HTMLButtonElement, { data?: any }>((props, ref) => {
    const email = props.data?.email;
    if (!email) return null;

    return (
      <Button ref={ref} variant="ghost" size="sm" className="gap-2">
        <ChartBar className="h-4 w-4" />
        <span>Thread Analytics</span>
      </Button>
    );
  }),
);

const SearchAnalytics = memo(
  React.forwardRef<HTMLButtonElement>((props, ref) => {
    return (
      <Button ref={ref} variant="ghost" size="sm" className="gap-2">
        <Users className="h-4 w-4" />
        <span>Top Contacts</span>
      </Button>
    );
  }),
);

const EmailAnalyticsPlugin: Plugin = {
  metadata: {
    id: "email-analytics",
    name: "Email Analytics",
    description: "Add analytics features to your email client",
    version: "1.0.0",
    author: "Zero Email",
  },
  uiExtensions: [
    {
      location: EXTENSION_POINTS.MAIL_LIST.LIST_ITEM,
      component: <MailListAnalytics />,
      priority: 100,
    },
    {
      location: EXTENSION_POINTS.MAIL_VIEW.TOOLBAR,
      component: <MailViewAnalytics />,
      priority: 50,
    },
    {
      location: EXTENSION_POINTS.SEARCH.ACTIONS,
      component: <SearchAnalytics />,
      priority: 50,
    },
  ],
};

export default EmailAnalyticsPlugin;
