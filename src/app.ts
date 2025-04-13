import express from 'express';
import bodyParser from 'body-parser';
import userRoute from './routes/user.route'
import authRoute from './routes/auth.route'
import walletRoute from './routes/wallet.route'

const app = express()

const port: number = 3000

app.use(bodyParser.json())

app.use('/api/user', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/wallet', walletRoute)

app.listen(port, () => console.log(`Application is running on port ${port}`))