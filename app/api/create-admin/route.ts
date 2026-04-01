// // app/api/create-admin/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { hashPassword } from "@/lib/hash";

// export async function POST() {
//   try {
//     const email = process.env.ADMIN_EMAIL || "admin@lummina.com";
//     const password = process.env.ADMIN_PASSWORD || "Ayanfe@2013";

//     // Hash the password
//     const hashedPassword = await hashPassword(password);

//     // Check if admin already exists
//     const existingAdmin = await prisma.user.findUnique({ where: { email } });

//     if (existingAdmin) {
//       return NextResponse.json({ message: "Admin already exists" });
//     }

//     // Create the admin user
//     await prisma.user.create({
//       data: {
//         name: "Admin",
//         email,
//         password: hashedPassword,
//         role: "ADMIN",
//       },
//     });

//     return NextResponse.json({ message: "Admin user created ✅" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
//   }
// }