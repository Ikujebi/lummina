import ChatClient from "../ChatClient";

export default function Page({
  params,
}: {
  params: { matterId: string };
}) {
  return <ChatClient params={params} />;
}