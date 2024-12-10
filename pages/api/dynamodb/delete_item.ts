// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";
import {delete_item} from "@/dynamodb";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await delete_item(req.body);
        res.status(200).json('success');
    } catch (e) {
        res.status(400).json(e);
    }
}
