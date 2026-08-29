"use client";

import { Inbox } from "@novu/nextjs";

type NovuInboxProps = {
  subscriberId: string;
};

export default function NovuInbox({
  subscriberId,
}: NovuInboxProps) {
  return (
    <Inbox
      applicationIdentifier={
        process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER!
      }
      subscriberId={subscriberId}
      socketUrl="wss://socket.novu.co"
      appearance={{
        variables: {
          colorPrimary: "#DD2450",
          colorForeground: "#0E121B",
        },
      }}
    />
  );
}