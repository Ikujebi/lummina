import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

interface AppointmentBody {
  id?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  matterId?: string;
}

// GET: List upcoming appointments for current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      createdBy: user.id,
      endTime: { gte: now },
    },
    orderBy: { startTime: "asc" },
    include: {
      matter: true,
      creator: true,
    },
  });

  return NextResponse.json(appointments);
}

// POST: Create a new appointment
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: AppointmentBody = await req.json();
    const { title, startTime, endTime, matterId } = body;

    if (!title || !startTime || !endTime || !matterId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        matterId,
        createdBy: user.id,
      },
      include: {
        matter: true,
        creator: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing appointment
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: AppointmentBody = await req.json();
    const { id, title, startTime, endTime } = body;

    if (!id)
      return NextResponse.json(
        { error: "Missing appointment ID" },
        { status: 400 }
      );

    // Check ownership first
    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        title: title ?? undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
      include: {
        matter: true,
        creator: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an appointment
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();

    if (!id)
      return NextResponse.json(
        { error: "Missing appointment ID" },
        { status: 400 }
      );

    // Check ownership first
    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}