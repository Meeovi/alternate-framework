import type { SetCartAddressArgs, SetShippingAddress } from "./checkout";

export function isShippingAddress(args: SetCartAddressArgs): args is SetShippingAddress {
  return (args as SetShippingAddress).shippingAddress !== undefined;
}
