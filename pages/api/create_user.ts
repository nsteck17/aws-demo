// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log('create_user:', req.body);
    try {
        const user = await prisma.user.create({ data: req.body });
        res.status(200).json(user);
    } catch (e) {
        res.status(400).json(e);
    }
}
