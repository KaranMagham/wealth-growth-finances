import type { NotificationChannel } from "./types";

type DeliveryNotification = {
  title: string;
  message: string;
  channels: NotificationChannel[];
};

type DeliveryResults = {
  inApp: boolean;
  email: boolean;
  desktop: boolean;
};

export async function deliverNotification(
  notification: DeliveryNotification
): Promise<DeliveryResults> {
  const results: DeliveryResults = {
    inApp: false,
    email: false,
    desktop: false,
  };

  if (notification.channels.includes("IN_APP")) {
    results.inApp = true;
  }

  if (notification.channels.includes("EMAIL")) {
    // Novu email delivery will be connected here.
    results.email = false;
  }

  if (notification.channels.includes("DESKTOP")) {
    // Browser desktop delivery will be triggered by the client.
    results.desktop = false;
  }

  return results;
}