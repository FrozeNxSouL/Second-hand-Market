"use client"
import { AuthProvider } from "@/hooks/useAuth";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
