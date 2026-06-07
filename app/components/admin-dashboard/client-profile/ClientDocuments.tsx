"use client";

import { useEffect, useState } from "react";
import { Empty, Spin, Tag } from "antd";

type Document = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

export default function ClientDocuments({
  clientId,
}: {
  clientId: string;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${clientId}/documents`)
      .then((res) => res.json())
      .then((data) =>
        setDocuments(data.documents ?? [])
      )
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <Spin />;

  if (!documents.length) {
    return <Empty description="No documents uploaded" />;
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border rounded-lg p-4 flex justify-between"
        >
          <div>
            <p className="font-medium">{doc.name}</p>

            <p className="text-xs text-gray-500">
              {new Date(
                doc.createdAt
              ).toLocaleDateString()}
            </p>
          </div>

          <Tag>{doc.status}</Tag>
        </div>
      ))}
    </div>
  );
}