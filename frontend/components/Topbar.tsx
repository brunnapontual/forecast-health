"use client"

import { useRouter } from "next/navigation"

interface Props {
  userName: string
}

export function Topbar({ userName }: Props) {
  const router = useRouter()

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  function handleLogout() {
    localStorage.removeItem("hp_user")
    router.push("/login")
  }

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900">
            <span className="text-[10px] font-bold text-white">FH</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            Forecast Health
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
              <span className="text-[11px] font-medium text-gray-600">{initials}</span>
            </div>
            <span className="text-sm text-gray-600">{userName}</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 transition-colors hover:text-gray-700"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}