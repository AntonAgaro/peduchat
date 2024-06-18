import jwt from 'jsonwebtoken';
import config from '../config/auth.config'
import {Request, Response, NextFunction} from "express";

export default function(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'];
    console.log(token)
    if (!token) {
        req.user = null
        next()
        return
    }

    jwt.verify(token as string, config.secret, (err, decoded) => {
        if (err) {
            req.user = null
            next()
            return
        }

        req.user = decoded ?? null
        console.log(req.user)
        next()
    })
}
//
// export function isAdmin(req: Request, res: Response, next: NextFunction) {}
//
// export function isModerator(req: Request, res: Response, next: NextFunction) {}
//
// export function isModeratorOrAdmin(req: Request, res: Response, next: NextFunction) {}