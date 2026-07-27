import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL ?? "";

let poolConnectionString = connectionString;
if (poolConnectionString && !/sslmode=/i.test(poolConnectionString)) {
  const sep = poolConnectionString.includes("?") ? "&" : "?";
  poolConnectionString = `${poolConnectionString}${sep}uselibpqcompat=true&sslmode=require`;
}

const pool = new Pool({ connectionString: poolConnectionString });
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
