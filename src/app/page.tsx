"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  if (session?.user) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 ">
        Signed in as {session?.user.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    );
  }
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      Not signed in <br />
      <Button onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
        Sign in
      </Button>
    </div>
  );
}
