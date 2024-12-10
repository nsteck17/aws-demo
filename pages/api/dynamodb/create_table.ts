// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";
import {create_table, insert_to_table} from "@/dynamodb";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        console.log("aaa",req.body);
        const table = await create_table( req.body );
        res.status(200).json(table);
        console.log("aaa",table);
    } catch (e) {
        res.status(400).json(e);
    }
}
