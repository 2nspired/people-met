import { env } from "~/env";

export const isServer = typeof window === "undefined";
export const isBrowser = typeof window !== "undefined";

export const isDev = env.NEXT_PUBLIC_NODE_ENV === "development";
export const isProd = env.NEXT_PUBLIC_NODE_ENV === "production";

const getHostname = () => {
  return isDev
    ? "localhost:3000"
    : env.NEXT_PUBLIC_NODE_ENV === "preview"
      ? env.NEXT_PUBLIC_VERCEL_URL
      : "people-met.vercel.app";
};

const getProtocol = () => {
  return isDev ? "http" : "https";
};

const getBaseURL = () => {
  const protocol = getProtocol();
  const hostname = getHostname();
  return `${protocol}://${hostname}`;
};

export const baseURL = getBaseURL();
