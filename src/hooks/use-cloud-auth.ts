import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import type { CloudAuthState, CloudUser } from "@/types";

interface UseCloudAuthReturn {
  user: CloudUser | null;
  /** When this desktop signed in, as the backend recorded it. */
  loggedInAt: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  exchangeDeviceCode: (code: string) => Promise<CloudAuthState>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<CloudUser>;
}

const LOCAL_USER: CloudUser = {
  id: "local-personal",
  email: "local@donut.browser",
  plan: "enterprise",
  effectivePlan: "enterprise",
  planPeriod: "lifetime",
  subscriptionStatus: "active",
  profileLimit: 999999,
  cloudProfilesUsed: 0,
  proxyBandwidthLimitMb: 99999999,
  proxyBandwidthUsedMb: 0,
  proxyBandwidthExtraMb: 0,
  deviceOrdinal: 1,
  deviceCount: 1,
  isPrimaryDevice: true,
  entitlements: {
    active: true,
    browserAutomation: true,
    crossOsFingerprints: true,
    cloudBackup: true,
    teamCollaboration: true,
    cookieBot: true,
    remoteInteractive: true,
    remoteControl: true,
    agentAutomation: true,
    profileLimit: 999999,
    requestsPerHour: 999999,
    remoteBrowserHours: 999999,
  },
};

const DEFAULT_AUTH_STATE: CloudAuthState = {
  user: LOCAL_USER,
  logged_in_at: "2026-01-01T00:00:00.000Z",
};

export function useCloudAuth(): UseCloudAuthReturn {
  const [authState, setAuthState] = useState<CloudAuthState>(DEFAULT_AUTH_STATE);
  const [isLoading, setIsLoading] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const state = await invoke<CloudAuthState | null>("cloud_get_user");
      if (state) {
        setAuthState(state);
      } else {
        setAuthState(DEFAULT_AUTH_STATE);
      }
    } catch (_error) {
      setAuthState(DEFAULT_AUTH_STATE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();

    const unlistenExpired = listen("cloud-auth-expired", () => {
      setAuthState(DEFAULT_AUTH_STATE);
    });

    const unlistenChanged = listen("cloud-auth-changed", () => {
      void loadUser();
    });

    return () => {
      void unlistenExpired.then((unlisten) => {
        unlisten();
      });
      void unlistenChanged.then((unlisten) => {
        unlisten();
      });
    };
  }, [loadUser]);

  const exchangeDeviceCode = useCallback(
    async (code: string): Promise<CloudAuthState> => {
      try {
        const state = await invoke<CloudAuthState>("cloud_exchange_device_code", {
          code,
        });
        setAuthState(state);
        return state;
      } catch (_error) {
        return DEFAULT_AUTH_STATE;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await invoke("cloud_logout");
    } catch (_error) {
      // ignore
    }
    setAuthState(DEFAULT_AUTH_STATE);
  }, []);

  const refreshProfile = useCallback(async (): Promise<CloudUser> => {
    try {
      const user = await invoke<CloudUser>("cloud_refresh_profile");
      setAuthState((prev) => ({ ...prev, user }));
      return user;
    } catch (_error) {
      return LOCAL_USER;
    }
  }, []);

  return {
    user: authState.user,
    loggedInAt: authState.logged_in_at,
    isLoggedIn: true,
    isLoading,
    exchangeDeviceCode,
    logout,
    refreshProfile,
  };
}
