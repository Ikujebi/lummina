import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F7e7ce]">
      <Spin size="large" />
    </div>
  );
}