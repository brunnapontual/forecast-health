const BASE_URL = "http://localhost:8000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || "Erro inesperado.")
  }

  return data as T
}

export interface HorizonData {
  metrics: {
    avg_occupancy_rate: number
    avg_stay_hours: number
    total_admissions: number
  }
  chart: { label: string; pct: number }[]
}

export interface UploadResult {
  filename: string
  rows: number
  horizons: {
    "7d": HorizonData
    months: HorizonData
    years: HorizonData
  }
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  uploadData: async (file: File): Promise<UploadResult> => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`${BASE_URL}/data/upload`, { method: "POST", body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "Erro no upload.")
    return data as UploadResult
  },
}