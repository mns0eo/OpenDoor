import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingState } from "@/components/ui";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  );
}
