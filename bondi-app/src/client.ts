import { ThirdwebSDK } from "@thirdweb-dev/sdk";

export const client = new ThirdwebSDK(84532, {
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});