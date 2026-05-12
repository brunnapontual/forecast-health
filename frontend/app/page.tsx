"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"

interface User {
  name: string
  email: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("hp_user")
    if (!stored) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-white">
      <Topbar userName={user.name} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="border-b border-gray-100 pb-10">
          <h1 className="text-2xl font-semibold text-gray-900">
            Olá, {user.name}
          </h1>
          <p className="mt-1.5 text-sm text-gray-400">
            Bem-vindo ao Forecast Health — sistema de previsão de demanda hospitalar.
          </p>
        </div>

        <div className="mt-10">
          <p className="text-sm text-gray-400">
            O dashboard interativo.
          </p>
        </div>
      </main>
    </div>
  )
}