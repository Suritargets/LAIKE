"use client";

import { createContext, useContext, useState, useCallback } from "react";
import EarlyAccessModal from "./EarlyAccessModal";
import DemoModal from "./DemoModal";
import DonateModal from "./DonateModal";

type ModalType = "early_access" | "demo" | "donate" | null;

interface ModalContextValue {
  openEarlyAccess: () => void;
  openDemo: () => void;
  openDonate: (amount?: number) => void;
}

const ModalContext = createContext<ModalContextValue>({
  openEarlyAccess: () => {},
  openDemo: () => {},
  openDonate: () => {},
});

export function useModals() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [donateAmount, setDonateAmount] = useState<number | undefined>();

  const openEarlyAccess = useCallback(() => setActiveModal("early_access"), []);
  const openDemo = useCallback(() => setActiveModal("demo"), []);
  const openDonate = useCallback((amount?: number) => {
    setDonateAmount(amount);
    setActiveModal("donate");
  }, []);
  const close = useCallback(() => {
    setActiveModal(null);
    setDonateAmount(undefined);
  }, []);

  return (
    <ModalContext.Provider value={{ openEarlyAccess, openDemo, openDonate }}>
      {children}
      <EarlyAccessModal open={activeModal === "early_access"} onClose={close} />
      <DemoModal open={activeModal === "demo"} onClose={close} />
      <DonateModal open={activeModal === "donate"} onClose={close} prefilledAmount={donateAmount} />
    </ModalContext.Provider>
  );
}
