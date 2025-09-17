/// <reference lib="webworker" />

declare global {
  interface Window {
    serviceWorker?: ServiceWorkerContainer;
  }
}

// Extend the global scope to include Service Worker types
declare global {
  interface ServiceWorkerGlobalScope {
    addEventListener(
      type: "install",
      listener: (event: ExtendableEvent) => void,
    ): void;
    addEventListener(
      type: "activate",
      listener: (event: ExtendableEvent) => void,
    ): void;
    addEventListener(
      type: "fetch",
      listener: (event: FetchEvent) => void,
    ): void;
    addEventListener(type: "sync", listener: (event: SyncEvent) => void): void;
    addEventListener(type: "push", listener: (event: PushEvent) => void): void;
    addEventListener(
      type: "notificationclick",
      listener: (event: NotificationEvent) => void,
    ): void;
    addEventListener(
      type: "notificationclose",
      listener: (event: NotificationEvent) => void,
    ): void;
    addEventListener(
      type: "message",
      listener: (event: MessageEvent) => void,
    ): void;
  }

  interface ExtendableEvent extends Event {
    waitUntil(promise: Promise<unknown>): void;
  }

  interface FetchEvent extends ExtendableEvent {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
  }

  interface SyncEvent extends ExtendableEvent {
    tag: string;
  }

  interface PushEvent extends ExtendableEvent {
    data?: PushMessageData;
  }

  interface NotificationEvent extends ExtendableEvent {
    notification: Notification;
    action?: string;
  }
}

export {};
