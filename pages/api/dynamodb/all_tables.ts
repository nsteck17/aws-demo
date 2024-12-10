// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";
import {list_tables} from "@/dynamodb";
import {TableDescription} from "@aws-sdk/client-dynamodb/dist-types/models";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const tables = await list_tables();
    console.log("=====", tables)
    return res.status(200).json(tables)
}
