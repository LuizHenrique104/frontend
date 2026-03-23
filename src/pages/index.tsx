// frontend-tailwind/src/pages/index.tsx
import { useState, useEffect } from 'react'
import { Purchase } from '../types/purchases'
import Head from 'next/head'

export default function Home() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    value: '',
    date: ''
  })

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setPurchases(data)
    } catch (error) {
      console.error('Erro ao carregar compras:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newPurchase = {
        id: crypto.randomUUID(),
        value: Number(formData.value),
        date: formData.date // send date as YYYY-MM-DD to avoid timezone shifts
      }

      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPurchase)
      })

      if (res.ok) {
        setFormData({ value: '', date: '' })
        try {
          const created = await res.json()
          if (created && created.id) {
            setPurchases((prev) => [created, ...prev])
            setLoading(false)
          } else {
            fetchPurchases()
          }
        } catch {
          fetchPurchases()
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Erro' }))
        alert('Falha ao salvar: ' + (err.error || JSON.stringify(err)))
      }
    } catch (error) {
      console.error('Erro ao salvar compra:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      const datePart = String(dateString).split('T')[0]
      const [y, m, d] = datePart.split('-').map(Number)
      const dt = new Date(y, (m || 1) - 1, d || 1)
      return dt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (err) {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  return (
    <>
      <Head>
        <title>Controle de Compras</title>
        <meta name="description" content="Controle suas compras de forma simples" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, body { font-family: 'Plus Jakarta Sans', sans-serif; }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.35); cursor: pointer; }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[#111318]">

        {/* Subtle top accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-blue-400 to-cyan-400" />

        <div className="max-w-2xl mx-auto px-6 py-12">

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-400 to-blue-400" />
              <span className="text-[11px] font-600 tracking-[0.15em] uppercase text-white/30">
                Finanças
              </span>
            </div>
            <h1 className="text-[32px] font-700 text-white leading-tight tracking-tight mb-2">
              Controle de Compras
            </h1>
            <p className="text-[14px] text-white/35 font-300 leading-relaxed">
              Registre e acompanhe suas despesas
            </p>
          </header>

          <main className="space-y-3">

            {/* Form Card */}
            <div className="bg-[#181b22] border border-white/[0.06] rounded-2xl p-6">

              <p className="text-[12px] font-600 tracking-[0.12em] uppercase text-white/30 mb-5">
                Nova entrada
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-5">

                  <div>
                    <label className="block text-[11px] font-500 text-white/30 tracking-wide uppercase mb-2">
                      Valor
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm font-500">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0,00"
                        className="w-full bg-[#111318] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-[14px] font-400 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.04] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-500 text-white/30 tracking-wide uppercase mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#111318] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-[14px] font-400 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.04] transition-all"
                      required
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-[13px] font-600 tracking-wide py-3 rounded-xl transition-all duration-150"
                >
                  Adicionar
                </button>
              </form>
            </div>

            {/* List Card */}
            <div className="bg-[#181b22] border border-white/[0.06] rounded-2xl overflow-hidden">

              {/* List header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
                <p className="text-[12px] font-600 tracking-[0.12em] uppercase text-white/30">
                  Histórico
                </p>
                {!loading && purchases.length > 0 && (
                  <span className="text-[11px] font-500 text-white/20 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                    {purchases.length} {purchases.length === 1 ? 'item' : 'itens'}
                  </span>
                )}
              </div>

              {/* List body */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
                  <p className="text-[13px] text-white/20">Carregando...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-1">
                    <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-white/25 font-400">Nenhuma compra ainda</p>
                  <p className="text-[12px] text-white/15">Adicione sua primeira entrada acima</p>
                </div>
              ) : (
                <div>
                  {purchases.map((purchase, index) => (
                    <div
                      key={purchase.id}
                      className="group flex items-center justify-between px-6 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Left: index + info */}
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-500 text-white/15 w-5 text-right tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="w-px h-6 bg-white/[0.06]" />
                        <div>
                          <p className="text-[15px] font-600 text-white tabular-nums">
                            {formatCurrency(purchase.value)}
                          </p>
                          <p className="text-[12px] text-white/30 mt-0.5">
                            {formatDate(purchase.date)}
                          </p>
                        </div>
                      </div>

                      {/* Right: id + delete */}
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-[10px] font-400 text-white/15 tracking-wider">
                          #{purchase.id.slice(0, 8)}
                        </span>
                        <button
                          onClick={async () => {
                            if (!confirm('Confirma exclusão desta compra?')) return
                            try {
                              const res = await fetch(`/api/purchases?id=${encodeURIComponent(purchase.id)}`, { method: 'DELETE' })
                              if (res.ok) {
                                setPurchases((prev) => prev.filter((p) => p.id !== purchase.id))
                              } else {
                                const err = await res.json().catch(() => ({}))
                                alert('Falha ao deletar: ' + (err.error || JSON.stringify(err)))
                              }
                            } catch (err) {
                              console.error('Erro ao deletar:', err)
                              alert('Erro ao deletar')
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[11px] font-500 text-red-400/60 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 hover:bg-red-400/[0.06] px-3 py-1 rounded-lg transition-all"
                          aria-label={`Deletar compra ${purchase.id}`}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary footer */}
              {!loading && purchases.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/[0.06]">
                  <p className="text-[12px] text-white/25 font-400">Total</p>
                  <p className="text-[18px] font-700 text-white tabular-nums">
                    {formatCurrency(purchases.reduce((sum, p) => sum + p.value, 0))}
                  </p>
                </div>
              )}
            </div>

          </main>

          {/* Footer */}
          <footer className="text-center mt-10">
            <p className="text-[11px] text-white/15">© 2026 Controle de Compras</p>
          </footer>

        </div>
      </div>
    </>
  )
}