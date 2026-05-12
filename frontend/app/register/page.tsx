"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/services/api"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.register({ name, email, password })
      router.push("/login")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-xs font-bold text-white">FH</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">Forecast Health</h1>
            <p className="mt-1 text-sm text-gray-500">Crie sua conta</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Instituição hospitalar
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="Ex.: Hospital Santa Joana"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="hospital@instituição.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}