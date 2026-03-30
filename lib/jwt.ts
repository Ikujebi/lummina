import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}