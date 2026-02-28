import { ReactNode } from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

function convexUrl(): string {
  const url = import.meta.env.VITE_CONVEX_URL as string;
  if (!url) {
    throw new Error("Couldn't find the Convex deployment URL.");
  }
  return url;
}

export const convexClient = new ConvexReactClient(convexUrl(), { unsavedChangesWarning: false });

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
