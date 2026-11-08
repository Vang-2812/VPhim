import { describe, it, expect, beforeEach } from "vitest";
import {
  detectDeviceType,
  getOrCreateVisitorId,
} from "@/features/analytics/route-tracker";

describe("Analytics Route Tracker", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("detects mobile devices from user agent", () => {
    const iphoneUA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
    const androidPhoneUA =
      "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

    expect(detectDeviceType(iphoneUA)).toBe("mobile");
    expect(detectDeviceType(androidPhoneUA)).toBe("mobile");
  });

  it("detects tablet devices from user agent", () => {
    const ipadUA =
      "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
    const androidTabletUA =
      "Mozilla/5.0 (Linux; Android 12; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.154 Safari/537.36";

    expect(detectDeviceType(ipadUA)).toBe("tablet");
    expect(detectDeviceType(androidTabletUA)).toBe("tablet");
  });

  it("detects desktop devices from user agent", () => {
    const macUA =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const winUA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";

    expect(detectDeviceType(macUA)).toBe("desktop");
    expect(detectDeviceType(winUA)).toBe("desktop");
  });

  it("persists visitor id in localStorage across calls", () => {
    const firstId = getOrCreateVisitorId();
    expect(firstId).toBeTruthy();
    expect(typeof firstId).toBe("string");

    const secondId = getOrCreateVisitorId();
    expect(secondId).toBe(firstId);
  });
});
