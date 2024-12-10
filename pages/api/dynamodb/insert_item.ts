// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";
import {insert_to_table} from "@/dynamodb";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const user = await insert_to_table( req.body );
        res.status(200).json(user);
    } catch (e) {
        res.status(400).json(e);
    }
}
