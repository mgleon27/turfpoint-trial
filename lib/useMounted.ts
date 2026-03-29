"use client";

import { useEffect, useState } from "react";

export default function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return mounted;
}