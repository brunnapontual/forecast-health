"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { api, type UploadResult, type HorizonData } from "@/services/api"

interface User { name: string; email: string }

type Period = "7d" | "months" | "years"

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "months", label: "Meses" },
  { key: "years", label: "Anos" },
]

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "últimos 7 dias",
  months: "por mês",
  years: "por ano",
}

const staticAlerts = [
  { level: "high" as const, title: "Risco de superlotação", detail: "Alta probabilidade para sexta-feira" },
  { level: "medium" as const, title: "Aumento de admissões previsto", detail: "+18% estimado nos próximos 3 dias" },
  { level: "medium" as const, title: "Abertura de leitos recomendada", detail: "Monitorar capacidade no fim de semana" },
]

const staticRecommendations = [
  "Considerar abertura de 5 leitos extras para o fim de semana",
  "Reforçar equipe de plantão na sexta-feira",
  "Monitorar aumento de admissões respiratórias",
]

function LineChart({ points }: { points: { label: string; pct: number }[] }) {
  if (!points.length) {
    return (
      <div className="flex h-44 flex-col items-center justify-center gap-1">
        <p className="text-sm text-gray-400">Nenhum dado carregado</p>
        <p className="text-xs text-gray-300">Importe um arquivo CSV ou XLSX para visualizar</p>
      </div>
    )
  }

  const VW = 700, VH = 160
  const pad = { l: 16, r: 16, t: 28, b: 32 }
  const cW = VW - pad.l - pad.r
  const cH = VH - pad.t - pad.b

  const vals = points.map(p => p.pct)
  const minV = Math.max(0, Math.min(...vals) - 10)
  const maxV = Math.min(100, Math.max(...vals) + 10)
  const range = maxV - minV || 1

  const pts = points.map((p, i) => ({
    x: pad.l + (i / Math.max(points.length - 1, 1)) * cW,
    y: pad.t + (1 - (p.pct - minV) / range) * cH,
    ...p,
  }))

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const bottom = pad.t + cH
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111827" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#111827" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <text x={p.x} y={p.y - 9} textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="inherit">
            {p.pct}%
          </text>
          <circle cx={p.x} cy={p.y} r="3" fill="white" stroke="#111827" strokeWidth="1.5" />
          <text x={p.x} y={VH - 7} textAnchor="middle" fill="#9ca3af" fontSize="11" fontFamily="inherit">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [upload, setUpload] = useState<UploadResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>("7d")

  useEffect(() => {
    const stored = localStorage.getItem("hp_user")
    if (!stored) { router.push("/login"); return }
    setUser(JSON.parse(stored))
  }, [router])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    e.target.value = ""
    try {
      setUpload(await api.uploadData(file))
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Erro no upload.")
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  const horizon: HorizonData | null = upload?.horizons[period] ?? null

  const metrics = [
    { label: "Taxa de ocupação", value: horizon ? `${horizon.metrics.avg_occupancy_rate}` : "—", unit: "%" },
    { label: "Permanência média", value: horizon ? `${Math.round(horizon.metrics.avg_stay_hours)}` : "—", unit: "h" },
    { label: "Admissões no período", value: horizon ? `${horizon.metrics.total_admissions}` : "—", unit: "total" },
  ]

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
            <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition ${uploading ? "text-gray-400" : "text-gray-700 hover:bg-gray-50"}`}>
              {uploading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {upload ? "Reimportar dados" : "Importar dados"}
                </>
              )}
              <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>

            {upload && !uploading && (
              <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-1.5">
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="max-w-[220px] truncate text-xs text-green-700">
                  {upload.filename} · {upload.rows} registros
                </span>
              </div>
            )}
            {uploadError && <p className="max-w-[240px] text-right text-xs text-red-500">{uploadError}</p>}
          </div>
        </div>

        {/* Seletor de horizonte */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 w-fit">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`rounded-md px-3.5 py-1.5 text-sm transition ${
                  period === p.key ? "bg-gray-900 font-medium text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="mb-5 grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-gray-200 bg-white px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{m.label}</p>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-gray-900">{m.value}</span>
                <span className="mb-0.5 text-sm text-gray-400">{m.unit}</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                {upload ? `Média ${PERIOD_LABELS[period]}` : "Importe dados para visualizar"}
              </p>
            </div>
          ))}
        </div>

        {/* Gráfico + Alertas */}
        <div className="mb-5 grid grid-cols-3 gap-4">

          <div className="col-span-2 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Ocupação hospitalar</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {upload ? `${upload.rows} registros · ${upload.filename}` : "Importe dados para visualizar"}
                </p>
              </div>
              <span className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                {PERIODS.find(p => p.key === period)?.label}
              </span>
            </div>
            <div className="px-4 pb-4 pt-3">
              <LineChart points={horizon?.chart ?? []} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-sm font-medium text-gray-900">Alertas operacionais</p>
            </div>
            <div className="divide-y divide-gray-50 px-5">
              {staticAlerts.map((alert) => (
                <div key={alert.title} className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${alert.level === "high" ? "bg-red-400" : "bg-amber-400"}`} />
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
            <p className="mt-0.5 text-xs text-gray-400">Geradas com base na análise de demanda</p>
          </div>
          <div className="divide-y divide-gray-50">
            {staticRecommendations.map((rec, i) => (
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