"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function App({
  children,
  session,
}: {
  children: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
