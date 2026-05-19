import { config } from "dotenv"
import express from "express"
import morgan from "morgan"
import passport from "passport"
config()

const app = express()

app.use(morgan("dev"))
app.use(passport.initialize())



app.listen(3000, () => {
    console.log("server is running on port 3000")
})