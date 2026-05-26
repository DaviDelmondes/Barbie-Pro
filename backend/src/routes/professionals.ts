import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'professionals route' })
})

export default router
