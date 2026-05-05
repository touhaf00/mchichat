import { Request, Response, NextFunction } from 'express';
import { searchGifs } from "./giphy.service";

export async function searchGifsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query.q;

        if(typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({message: 'Paramétre q manquant'});
        }

        const gifs = await searchGifs(query.trim());

        res.status(200).json({gifs,});
    } catch (error) {
        next(error);
    }
}