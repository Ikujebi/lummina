import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const hashedPassword = await bcrypt.hash("Ayanfe@2013", 10);

  await client.query(
    `INSERT INTO "User" (name, email, password, role)
     VALUES ($1, $2, $3, $4)`,
    ["Admin User", "admin@lummina.com", hashedPassword, "ADMIN"]
  );

  console.log("Admin created via direct SQL!");
  await client.end();
}

createAdmin().catch(console.error);