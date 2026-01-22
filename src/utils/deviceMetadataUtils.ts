/**
 * Utility for capturing device and browser metadata
 */
export class DeviceMetadataUtils {
  /**
   * Get browser name and version
   */
  static getBrowserInfo(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let version = "Unknown";

    // Chrome
    if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
      version = ua.substring(ua.indexOf("Chrome") + 7).split(" ")[0];
    }
    // Safari
    else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
      browserName = "Safari";
      const versionIndex = ua.indexOf("Version/");
      if (versionIndex > -1) {
        version = ua.substring(versionIndex + 8).split(" ")[0];
      }
    }
    // Firefox
    else if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      version = ua.substring(ua.indexOf("Firefox") + 8).split(" ")[0];
    }
    // Edge
    else if (ua.indexOf("Edg") > -1) {
      browserName = "Edge";
      version = ua.substring(ua.indexOf("Edg") + 4).split(" ")[0];
    }
    // IE
    else if (ua.indexOf("Trident") > -1) {
      browserName = "IE";
      const versionIndex = ua.indexOf("rv:");
      if (versionIndex > -1) {
        version = ua.substring(versionIndex + 3).split(")")[0];
      }
    }

    return { name: browserName, version };
  }

  /**
   * Get operating system
   */
  static getOS(): string {
    const ua = navigator.userAgent;

    if (ua.indexOf("Win") > -1) return "Windows";
    if (ua.indexOf("Mac") > -1) return "MacOS";
    if (ua.indexOf("Linux") > -1) return "Linux";
    if (ua.indexOf("X11") > -1) return "UNIX";
    if (ua.indexOf("Android") > -1) return "Android";
    if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) return "iOS";

    return "Unknown";
  }

  /**
   * Get device type
   */
  static getDeviceType(): "mobile" | "tablet" | "desktop" {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet =
      /ipad|android(?!.*mobi)|tablet|kindle/i.test(ua);

    if (isTablet) return "tablet";
    if (isMobile) return "mobile";
    return "desktop";
  }

  /**
   * Get screen resolution
   */
  static getScreenResolution(): { width: number; height: number } {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  /**
   * Get viewport size
   */
  static getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Get connection type if available
   */
  static getConnectionType(): string {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) {
      return "Unknown";
    }

    return connection.effectiveType || "Unknown";
  }

  /**
   * Get language
   */
  static getLanguage(): string {
    return navigator.language || "Unknown";
  }

  /**
   * Get timezone
   */
  static getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Unknown";
    }
  }

  /**
   * Get complete device metadata
   */
  static getDeviceMetadata(): Record<string, unknown> {
    const browserInfo = this.getBrowserInfo();

    return {
      browser_name: browserInfo.name,
      browser_version: browserInfo.version,
      os: this.getOS(),
      device_type: this.getDeviceType(),
      screen_resolution: this.getScreenResolution(),
      viewport_size: this.getViewportSize(),
      connection_type: this.getConnectionType(),
      language: this.getLanguage(),
      timezone: this.getTimezone(),
      user_agent: navigator.userAgent,
    };
  }
}
