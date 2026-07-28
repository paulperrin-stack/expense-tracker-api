import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";

export async function signup(req: Request, res: Response) {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(409).json({ message: "Email already in use" });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}