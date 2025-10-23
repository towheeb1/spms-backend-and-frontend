// =============================================================
// File: src/components/doctor-login/useGeolocation.ts
// =============================================================
import { useState } from "react";
export default function useGeolocation(onSuccess: (pos: { lat: number; lng: number }) => void) {
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);
  const ask = () => {
    if (!navigator.geolocation) { setAllowed(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setAllowed(true); onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => setAllowed(false),
      { enableHighAccuracy: false, timeout: 9000 }
    );
  };
  return { ask, allowed } as const;
}
