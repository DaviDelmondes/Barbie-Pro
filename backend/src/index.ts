import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import appointmentsRouter from './routes/appointments'
import professionalsRouter from './routes/professionals'
import clientsRouter from './routes/clients'
import financialRouter from './routes/financial'

const app = express()
const PORT = process.env.PORT ?? 3333

app.use(cors())
app.use(express.json())

app.use('/appointments', appointmentsRouter)
app.use('/professionals', professionalsRouter)
app.use('/clients', clientsRouter)
app.use('/financial', financialRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
