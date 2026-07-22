import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_TTL } from "../config.js";

export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL }, (err, token) => {
            if (err) reject(err)
            resolve(token)
        });
    })
}
