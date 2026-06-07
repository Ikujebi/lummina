"use client";

import { useEffect, useState } from "react";
import { Spin, Empty, Tag } from "antd";

type Matter = {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  createdAt: string;
};

export default function ClientMatters({
  clientId,
}: {
  clientId: string;
}) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${clientId}/matters`)
      .then((res) => res.json())
      .then((data) => setMatters(data.matters ?? []))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <Spin />;

  if (!matters.length) {
    return <Empty description="No matters found" />;
  }

  return (
    <div className="space-y-3">
      {matters.map((matter) => (
        <div
          key={matter.id}
          className="border rounded-lg p-4"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">
                {matter.title}
              </p>

              <p className="text-sm text-gray-500">
                {matter.caseNumber}
              </p>
            </div>

            <Tag>{matter.status}</Tag>
          </div>
        </div>
      ))}
    </div>
  );
}