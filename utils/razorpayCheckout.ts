type RazorpayOpen = (options: Record<string, unknown>) => Promise<unknown>;

type RazorpayModule = {
  open: RazorpayOpen;
};

/**
 * Lazily loads react-native-razorpay.
 * A top-level import crashes when the native module is missing
 * (`new NativeEventEmitter()` with a null argument).
 */
export function getRazorpayCheckout(): RazorpayModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-razorpay").default as RazorpayModule;
    if (!mod?.open) {
      return null;
    }
    return mod;
  } catch {
    return null;
  }
}
