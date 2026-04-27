import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function Page({
  params,
}: {
  params: { matterId: string };
}) {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatClient params={params} />
    </Suspense>
  );
}