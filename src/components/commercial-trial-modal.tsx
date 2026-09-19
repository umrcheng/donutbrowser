"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "@/components/loading-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showErrorToast } from "@/lib/toast-utils";

interface CommercialTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialTrialModal(_props: CommercialTrialModalProps) {
  return null;
}
