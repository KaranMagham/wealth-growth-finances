import type {
  NotificationChannel,
  NotificationEvent,
  NotificationProvider,
} from "../types";

type NovuTriggerResponse = {
  acknowledged?: boolean;
  data?: unknown;
  error?: string;
};

export class NovuProvider implements NotificationProvider {
  private readonly apiKey: string;
  private readonly workflowId: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.NOVU_API_KEY ?? "";
    this.workflowId =
      process.env.NOVU_NOTIFICATION_WORKFLOW_ID ?? "";
    this.apiUrl =
      process.env.NOVU_API_URL ?? "https://api.novu.co/v1";
  }

  async send(
    notification: NotificationEvent
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error("NOVU_API_KEY is not configured");
    }

    if (!this.workflowId) {
      throw new Error(
        "NOVU_NOTIFICATION_WORKFLOW_ID is not configured"
      );
    }

    const channels = notification.channels ?? [];

    const payload = {
      name: this.workflowId,
      to: {
        type: "SubscriberId",
        subscriberId: notification.userId,
      },
      payload: {
        title:
          notification.externalTitle ?? notification.title,
        message:
          notification.externalMessage ?? notification.message,
        category: notification.category,
        severity: notification.severity,
        actionUrl: notification.actionUrl,
        ruleKey: notification.ruleKey,
        metadata: notification.metadata ?? {},
      },
      overrides: {
        email: {
          enabled: channels.includes("EMAIL"),
        },
        in_app: {
          enabled: channels.includes("IN_APP"),
        },
        chat: {
          enabled: channels.includes("DESKTOP"),
        },
      },
    };

    const response = await fetch(
      `${this.apiUrl}/events/trigger`,
      {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let responseBody: NovuTriggerResponse | null = null;

    try {
      responseBody =
        (await response.json()) as NovuTriggerResponse;
    } catch {
      responseBody = null;
    }

    if (!response.ok) {
      throw new Error(
        responseBody?.error ||
          `Novu request failed with status ${response.status}`
      );
    }

    if (
      responseBody?.acknowledged === false
    ) {
      throw new Error("Novu did not acknowledge the event");
    }
  }
}