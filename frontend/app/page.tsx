"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"

interface User {
  name: string
  email: string
}

const metrics = [
  { label: "Ocupação prevista", value: "—", unit: "leitos", description: "Próximas 24 horas" },
  { label: "Permanência média", value: "—", unit: "dias", description: "Últimos 30 dias" },
  { label: "Taxa de ocupação", value: "—", unit: "%", description: "Capacidade atual" },
]

const alerts = [
  { level: "high" as const, title: "Risco de superlotação", detail: "Alta probabilidade para sexta-feira" },
  { level: "medium" as const, title: "Aumento de admissões previsto", detail: "+18% estimado nos próximos 3 dias" },
  { level: "medium" as const, title: "Abertura de leitos recomendada", detail: "Monitorar capacidade no fim de semana" },
]

const recommendations = [
  "Considerar abertura de 5 leitos extras para o fim de semana",
  "Reforçar equipe de plantão na sexta-feira",
  "Monitorar aumento de admissões respiratórias",
]

const chartBars = [
  { day: "Seg", pct: 62 },
  { day: "Ter", pct: 71 },
  { day: "Qua", pct: 58 },
  { day: "Qui", pct: 84 },
  { day: "Sex", pct: 91 },
  { day: "Sáb", pct: 75 },
  { day: "Dom", pct: 68 },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploadDone, setUploadDone] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("hp_user")
    if (!stored) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(stored))
  }, [router])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file.name)
    setUploadDone(true)
    e.target.value = ""
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar userName={user.name} />
      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Cabeçalho */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Central Operacional, {user.name}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Painel de monitoramento e apoio à gestão preventiva
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importar dados
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {uploadDone && uploadedFile && (
              <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-1.5">
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="max-w-[200px] truncate text-xs text-green-700">{uploadedFile}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="mb-5 grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-gray-200 bg-white px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {m.label}
              </p>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-gray-900">
                  {m.value}
                </span>
                <span className="mb-0.5 text-sm text-gray-400">{m.unit}</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">{m.description}</p>
            </div>
          ))}
        </div>

        {/* Gráfico + Alertas */}
        <div className="mb-5 grid grid-cols-3 gap-4">

          <div className="col-span-2 rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <p className="text-sm font-medium text-gray-900">
                Previsão de ocupação — próximos 7 dias
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Importe dados históricos para gerar previsões reais
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="flex h-36 items-end gap-2">
                {chartBars.map((bar) => (
                  <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-gray-100"
                      style={{ height: `${bar.pct}%` }}
                    />
                    <span className="text-[11px] text-gray-400">{bar.day}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-xs text-gray-300">
                Previsões geradas com base em inteligência artificial
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-sm font-medium text-gray-900">Alertas operacionais</p>
            </div>
            <div className="divide-y divide-gray-50 px-5">
              {alerts.map((alert) => (
                <div key={alert.title} className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      alert.level === "high" ? "bg-red-400" : "bg-amber-400"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{alert.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-medium text-gray-900">Recomendações preventivas</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Geradas com base na análise de demanda
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 text-[10px] font-medium text-gray-400">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}