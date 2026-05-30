import { useEffect, useRef } from "react";

type UseBarcodeScannerParams = {
  enabled: boolean;
  minLength?: number;
  resetDelayMs?: number;
  onScan: (barcode: string) => void;
};

export function useBarcodeScanner({
  enabled,
  minLength = 8,
  resetDelayMs = 80,
  onScan,
}: UseBarcodeScannerParams) {
  const bufferRef = useRef("");
  const lastKeyAtRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      const key = event.key;

      if (now - lastKeyAtRef.current > resetDelayMs) {
        bufferRef.current = "";
      }

      lastKeyAtRef.current = now;

      if (key === "Enter") {
        const barcode = bufferRef.current.trim();
        bufferRef.current = "";

        if (barcode.length >= minLength) {
          event.preventDefault();
          onScanRef.current(barcode);
        }

        return;
      }

      if (key.length === 1 && /^[0-9A-Za-z]$/.test(key)) {
        bufferRef.current += key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, minLength, resetDelayMs]);
}