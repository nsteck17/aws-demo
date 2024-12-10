// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";
import {scan_table, ScanTableType} from "@/dynamodb";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ScanTableType>
) {

    const rows = await scan_table(req.body.TableName)
    return res.status(200).json(rows)
}
