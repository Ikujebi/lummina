import ChatClient from "../ChatClient";

export default async function Page({
  params,
}: {
  params: Promise<{ matterId: string }>;
}) {
  return <ChatClient params={await params} />;
}