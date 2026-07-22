"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect, ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
