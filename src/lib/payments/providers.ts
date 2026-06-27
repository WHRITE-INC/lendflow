// Provider registry. All production providers read server-only credentials
// inside the actual request path so secrets never reach the browser bundle.
import type { PaymentProvider, ProviderId } from "./types";
import { AirtelProvider } from "./airtel";
import { MpesaProvider } from "./mpesa";
import { MTNProvider } from "./mtn";

export { AirtelProvider, MpesaProvider, MTNProvider };

export function getProvider(id: ProviderId): PaymentProvider {
  switch (id) {
    case "mtn":
      return MTNProvider;
    case "airtel":
      return AirtelProvider;
    case "mpesa":
      return MpesaProvider;
  }
}
