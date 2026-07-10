"use client"
import { useAuth } from "@/hooks/useAuth";

export default function SignOutButton() {
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  }

  return (
    <li><a className="text-error" onClick={handleSignOut}>Logout</a></li>
  )
}