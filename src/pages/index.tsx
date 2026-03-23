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
        date: formData.date
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

  const total = purchases.reduce((sum, p) => sum + p.value, 0)

  return (
    <>
      <Head>
        <title>Controle de Compras</title>
        <meta name="description" content="Controle suas compras de forma simples" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          *, body { font-family: 'Plus Jakarta Sans', sans-serif; }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.3); cursor: pointer; }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .fade-up { animation: fadeUp 0.35s ease both; }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[#0e0f13]">

        {/* Background texture */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-64 -left-64 w-175 h-175 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute -bottom-64 -right-32 w-125 h-125 rounded-full bg-blue-600/8 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-160 mx-auto px-6 pt-14 pb-16">

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-600 tracking-[0.18em] uppercase text-violet-400/70 mb-3">
                  Controle Financeiro
                </p>
                <h1 className="text-[38px] font-800 leading-[1.1] text-white tracking-tight mb-2">
                  Minhas Compras
                </h1>
                <p className="text-[13px] text-white/30 font-300">
                  Registre e acompanhe seus gastos
                </p>
              </div>

              {/* Total — top right */}
              {!loading && purchases.length > 0 && (
                <div className="fade-up text-right mt-1">
                  <p className="text-[10px] font-600 tracking-widest uppercase text-white/25 mb-1.5">Total</p>
                  <p className="text-[26px] font-700 leading-none text-white tracking-tight">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-[11px] text-white/25 mt-1.5 font-400">
                    {purchases.length} {purchases.length === 1 ? 'registro' : 'registros'}
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mt-8 h-px bg-linear-to-r from-violet-500/40 via-white/10 to-transparent" />
          </header>

          <main className="space-y-4">

            {/* ── Form Card ── */}
            <div className="rounded-2xl bg-white/3 border border-white/[0.07] p-6 shadow-xl shadow-black/20">
              <p className="text-[11px] font-600 tracking-[0.15em] uppercase text-white/25 mb-5">
                Nova compra
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="block text-[11px] font-500 text-white/30 mb-1.5 tracking-wide">
                      Valor
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-white/20 font-500 select-none">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0,00"
                        className="w-full bg-white/4 border border-white/8 hover:border-white/[0.14] rounded-xl pl-9 pr-4 py-2.5 text-white text-[14px] font-400 placeholder:text-white/15 focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-500 text-white/30 mb-1.5 tracking-wide">
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white/4 border border-white/8 hover:border-white/[0.14] rounded-xl px-4 py-2.5 text-white text-[14px] font-400 focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl py-2.5 text-[13px] font-700 text-white tracking-wide bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-900/40 transition-all active:scale-[0.99]"
                >
                  Adicionar compra
                </button>
              </form>
            </div>

            {/* ── List Card ── */}
            <div className="rounded-2xl bg-white/3 border border-white/[0.07] overflow-hidden shadow-xl shadow-black/20">

              {/* List header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <p className="text-[11px] font-600 tracking-[0.15em] uppercase text-white/25">
                  Histórico
                </p>
                {!loading && purchases.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                    <span className="text-[11px] text-white/25 font-400">
                      {purchases.length} {purchases.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-white/10 border-t-violet-400 animate-spin" />
                  <p className="text-[12px] text-white/20 font-400">Carregando...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-2 text-center px-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/[0.07] flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-white/25 font-500">Nenhuma compra registrada</p>
                  <p className="text-[12px] text-white/15 font-300">Use o formulário acima para adicionar</p>
                </div>
              ) : (
                purchases.map((purchase, index) => (
                  <div
                    key={purchase.id}
                    className="group fade-up flex items-center gap-4 px-6 py-4 border-b border-white/4 last:border-b-0 hover:bg-white/25 transition-colors"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <span className="text-[11px] font-400 text-white/15 tabular-nums w-4 shrink-0">
                      {index + 1}
                    </span>

                    <div className="w-2 h-2 rounded-full bg-violet-400/50 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-600 text-white tabular-nums leading-none">
                        {formatCurrency(purchase.value)}
                      </p>
                      <p className="text-[11px] text-white/30 mt-1 tabular-nums font-400">
                        {formatDate(purchase.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline text-[10px] text-white/15 font-300 tracking-wider">
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
                        className="opacity-0 group-hover:opacity-100 text-[11px] font-500 text-red-400/50 hover:text-red-400 border border-red-400/15 hover:border-red-400/40 hover:bg-red-400/6 px-2.5 py-1 rounded-lg transition-all"
                        aria-label={`Deletar compra ${purchase.id}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Summary row */}
              {!loading && purchases.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white/2.5 border-t border-white/[0.07]">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-linear-to-b from-violet-400 to-blue-400" />
                    <p className="text-[12px] text-white/35 font-400">Total acumulado</p>
                  </div>
                  <p className="text-[20px] font-700 text-white leading-none tracking-tight">
                    {formatCurrency(total)}
                  </p>
                </div>
              )}
            </div>

          </main>

          <footer className="text-center mt-12">
            <p className="text-[11px] text-white/15 tracking-wide font-300">© 2026 Controle de Compras</p>
          </footer>

        </div>
      </div>
    </>
  )
}