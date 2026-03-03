"use client";

import Image from "next/image";
import lawyerPhoto from "@/public/img/careers.jpg";
import { Client } from "./types";

type Props = {
  client: Client;
};

export default function HeroSection({ client }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
      <div className="relative w-full lg:w-1/2 h-64 lg:h-auto">
        <Image
          src={lawyerPhoto}
          alt="Legal professional"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="p-8 flex flex-col justify-center lg:w-1/2">
        <h1 className="text-3xl font-bold text-[#5F021F] mb-3">
          Welcome back, {client.name}
        </h1>

        <p className="text-gray-600 mb-4">
          Your case <strong>{client.caseId}</strong> is currently{" "}
          <span className="text-[#FFA500] font-semibold">
            {client.status}
          </span>.
        </p>

        <p className="text-gray-500">
          Assigned Lawyer: <strong>{client.lawyer}</strong>
        </p>
      </div>
    </section>
  );
}