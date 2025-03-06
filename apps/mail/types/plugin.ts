import { ReactNode } from "react";

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}

export interface UIExtensionPoint {
  location: string;
  component: ReactNode;
  priority?: number;
}

export interface EmailDriver {
  id: string;
  name: string;
  send: (options: EmailSendOptions) => Promise<void>;
  receive: () => Promise<Email[]>;
}

export interface AuthProvider {
  id: string;
  name: string;
  authenticate: () => Promise<AuthResult>;
}

export interface PluginHook {
  event: string;
  handler: (...args: any[]) => Promise<void> | void;
  priority?: number;
}

export interface Plugin {
  metadata: PluginMetadata;
  uiExtensions?: UIExtensionPoint[];
  emailDrivers?: EmailDriver[];
  authProviders?: AuthProvider[];
  hooks?: PluginHook[];
  onActivate?: () => Promise<void> | void;
  onDeactivate?: () => Promise<void> | void;
}

export interface EmailSendOptions {
  to: string[];
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  content: string;
  timestamp: Date;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token?: string;
}
