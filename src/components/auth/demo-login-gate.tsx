"use client";

import type { ReactNode } from "react";
import { isDemoLoginUiEnabled } from "@/lib/demo-login";
import { LoginWithDemoOption } from "@/components/auth/demo-login-panel";
import type { DemoPersonaKind } from "@/lib/demo-personas";

export function DemoLoginGate({ children }: { children: ReactNode }) {
  if (!isDemoLoginUiEnabled()) return null;
  return children;
}

export function CustomerLoginWithDemo({ children }: { children: ReactNode }) {
  if (!isDemoLoginUiEnabled()) return children;
  return <LoginWithDemoOption kind="customer">{children}</LoginWithDemoOption>;
}

export function AdminLoginWithDemo({ children }: { children: ReactNode }) {
  if (!isDemoLoginUiEnabled()) return children;
  return <LoginWithDemoOption kind="staff">{children}</LoginWithDemoOption>;
}

/** Thin re-export for callers that need the kind union. */
export type { DemoPersonaKind };
