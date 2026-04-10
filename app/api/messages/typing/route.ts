import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { matterId, isTyping } = await req.json();

    if (!matterId) {
      return NextResponse.json(
        { error: "Missing matterId" },
        { status: 400 }
      );
    }

    await pusher.trigger(`matter-${matterId}`, "typing", {
      userId: user.id,
      name: user.name,
      isTyping,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Typing event failed" },
      { status: 500 }
    );
  }
}