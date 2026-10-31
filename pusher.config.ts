import {
  Pusher,
  PusherAuthorizerResult,
  PusherEvent,
} from "@pusher/pusher-websocket-react-native";
import constants from "./utils/constants";
import pusherApi from "./utils/api/pusher";
import { store } from "./store/store";
import { setOrderDeliveryStatus } from "./store/slices/OrderStatusSlice";

export type PusherOrderEventPayload = {
  order_id: string;
  payment_status: "created" | "paid" | "failed";
  amount: number;
  currency: string;
};

export type PusherOrderEventName =
  | "order-created"
  | "order-paid"
  | "order-status-updated";

let initialized = false;
let activeChannel: string | null = null;
let connecting: Promise<void> | null = null;

export function channelNameForUser(userId: string) {
  return `private-user-${userId}`;
}

function parseEventData(data: unknown): unknown {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

function onEvent(event: PusherEvent) {
  const payload = parseEventData(event.data);
  console.log("Pusher event:", {
    channelName: event.channelName,
    eventName: event.eventName,
    data: payload,
  });
  console.log(`Pusher ${event.eventName as PusherOrderEventName}:`, payload);

  if (event.eventName !== "order-status-updated") {
    return;
  }

  if (!payload || typeof payload !== "object") {
    return;
  }

  const record = payload as {
    order_id?: string;
    currency?: string;
    amount?: number;
    payment_status?: "created" | "paid" | "failed" | string;
    order_status?: string;
    estimated_delivery_time?: string;
  };

  if (
    typeof record.order_id === "string" &&
    typeof record.order_status === "string"
  ) {
    store.dispatch(
      setOrderDeliveryStatus({
        ...record,
        order_id: record.order_id,
        order_status: record.order_status,
      }),
    );
  }
}

async function onAuthorizer(
  channelName: string,
  socketId: string,
): Promise<PusherAuthorizerResult> {
  return pusherApi.auth(socketId, channelName);
}

export async function connectPusher(userId: string) {
  if (!userId) {
    return;
  }

  if (connecting) {
    await connecting;
  }

  connecting = (async () => {
    const pusher = Pusher.getInstance();
    const channelName = channelNameForUser(userId);

    if (!initialized) {
      await pusher.init({
        apiKey: constants.pusher.apiKey,
        cluster: constants.pusher.cluster,
        onAuthorizer,
        onConnectionStateChange: (currentState, previousState) => {
          console.log("Pusher connection:", previousState, "->", currentState);
        },
        onError: (message, code, error) => {
          console.log("Pusher error:", message, code, error);
        },
        onSubscriptionSucceeded: (channel) => {
          console.log("Pusher subscribed:", channel);
        },
        onSubscriptionError: (channel, message, error) => {
          console.log("Pusher subscription error:", channel, message, error);
        },
      });
      initialized = true;
    }

    if (activeChannel && activeChannel !== channelName) {
      try {
        await pusher.unsubscribe({ channelName: activeChannel });
      } catch (error) {
        console.log("Pusher unsubscribe error:", error);
      }
      activeChannel = null;
    }

    await pusher.connect();

    if (activeChannel !== channelName) {
      await pusher.subscribe({
        channelName,
        onEvent,
      });
      activeChannel = channelName;
    }

    console.log("Pusher connected for channel:", channelName);
  })();

  try {
    await connecting;
  } catch (error) {
    console.log("Pusher connect failed:", error);
  } finally {
    connecting = null;
  }
}

export async function disconnectPusher() {
  const pusher = Pusher.getInstance();

  try {
    if (activeChannel) {
      await pusher.unsubscribe({ channelName: activeChannel });
      activeChannel = null;
    }
    await pusher.disconnect();
    console.log("Pusher disconnected");
  } catch (error) {
    console.log("Pusher disconnect failed:", error);
  }
}
