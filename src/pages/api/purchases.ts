// frontend-tailwind/src/pages/api/purchases.ts
import type { NextApiRequest, NextApiResponse } from 'next'
const BACKEND_URL = process.env.BACKEND_URL ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000')

const mockPurchases = [
  { id: '1', date: new Date().toISOString(), value: 299.9 },
  { id: '2', date: new Date().toISOString(), value: 89.9 }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!BACKEND_URL) {
      return res.status(200).json(mockPurchases)
    }
    try {
      const r = await fetch(`${BACKEND_URL}/purchases`)
      const data = await r.json()
      return res.status(r.status).json(data)
    } catch (error) {
      console.error('Erro ao buscar compras:', error)
      return res.status(500).json({ error: 'Erro ao buscar compras' })
    }
  }

  if (req.method === 'POST') {
    if (!BACKEND_URL) {
      // echo back mock
      const p = req.body
      return res.status(201).json(p)
    }
    try {
      const r = await fetch(`${BACKEND_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })

      const data = await r.json()
      return res.status(r.status).json(data)
    } catch (error) {
      console.error('Erro ao salvar compra:', error)
      return res.status(500).json({ error: 'Erro ao salvar compra' })
    }
  }

  if (req.method === 'DELETE') {
    if (!BACKEND_URL) {
      return res.status(200).json({ success: true })
    }
    try {
      const id = (req.query.id as string) || (req.body && req.body.id)
      if (!id) return res.status(400).json({ error: 'id é obrigatório' })
      const r = await fetch(`${BACKEND_URL}/purchases/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
      const data = await r.json().catch(() => ({}))
      return res.status(r.status).json(data)
    } catch (error) {
      console.error('Erro ao deletar compra:', error)
      return res.status(500).json({ error: 'Erro ao deletar compra' })
    }
  }


  return res.status(405).json({ error: 'Método não permitido' })
}