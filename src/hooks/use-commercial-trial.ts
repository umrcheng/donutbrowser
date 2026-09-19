import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";

export interface TrialStatusActive {
  type: "Active";
  remaining_seconds: number;
  days_remaining: number;
  hours_remaining: number;
  minutes_remaining: number;
}

export interface TrialStatusExpired {
  type: "Expired";
}

export type TrialStatus = TrialStatusActive | TrialStatusExpired;

interface UseCommercialTrialReturn {
  trialStatus: TrialStatus | null;
  hasAcknowledged: boolean;
  isLoading: boolean;
  checkTrialStatus: () => Promise<void>;
}

export function useCommercialTrial(): UseCommercialTrialReturn {
  return {
    trialStatus: null,
    hasAcknowledged: true,
    isLoading: false,
    checkTrialStatus: async () => {},
  };
}
