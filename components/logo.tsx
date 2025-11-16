"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState, startTransition } from "react";

export const Logo = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) return null;

  return (
    <>
      {resolvedTheme === "dark" ? (
        <Image
          src="/images/schmipay-dark.svg"
          alt="Dark Mode Logo"
          width={200}
          height={50}
          priority
        />
      ) : (
        <Image
          src="/images/schmipay-light.svg"
          alt="Light Mode Logo"
          width={200}
          height={50}
          priority
        />
      )}
    </>
  );
};
