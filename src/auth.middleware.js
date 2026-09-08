import jwt from "jsonwebtoken";
import userModel from "./auth.model.js";
import { config } from "./config.js"

export const authenticateUser = async () => {
    try {
        const { token } = req.cookies

        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const { id } = jwt.verify(token, config.JWT)
        const user = await userModel.findById(id).select("-password").lean()

        if (!user) return res.status(401).json({ message: "Unauthorized" })
        req.user = user
        next()
    } catch (error) {
        const status = [
            'JsonWebTokenError', 'TokenExpiredError'
        ].includes(err.name) ? 401 : 500

        res.status(status).json({
            message: status === 401 ?
                'Unauthorized: invalid token' :
                'Auth error', error: err.message
        })
    }

}