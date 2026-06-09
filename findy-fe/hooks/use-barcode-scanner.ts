import { useEffect, useRef } from "react";
import { Platform } from "react-native";

type UseBarcodeScannerParams = {
  enabled: boolean;
  minLength?: number;
  resetDelayMs?: number;
  onScan: (barcode: string) => void;
};

const SCAN_DEDUPE_MS = 600;

export function useBarcodeScanner({
  enabled,
  minLength = 8,
  resetDelayMs = 100,
  onScan,
}: UseBarcodeScannerParams) {
  const bufferRef = useRef("");
  const lastKeyAtRef = useRef(0);
  const lastEmittedScanRef = useRef<{ barcode: string; at: number } | null>(
    null,
  );
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();

      if (now - lastKeyAtRef.current > resetDelayMs) {
        bufferRef.current = "";
      }

      lastKeyAtRef.current = now;

      if (event.key === "Enter" || event.key === "Tab") {
        const barcode = bufferRef.current.trim();
        bufferRef.current = "";

        if (barcode.length >= minLength) {
          event.preventDefault();

          const lastEmitted = lastEmittedScanRef.current;
          if (
            lastEmitted &&
            lastEmitted.barcode === barcode &&
            now - lastEmitted.at < SCAN_DEDUPE_MS
          ) {
            return;
          }

          lastEmittedScanRef.current = { barcode, at: now };
          onScanRef.current(barcode);
        }

        return;
      }

      if (event.key.length === 1 && /^[0-9A-Za-z]$/.test(event.key)) {
        bufferRef.current += event.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, minLength, resetDelayMs]);
}