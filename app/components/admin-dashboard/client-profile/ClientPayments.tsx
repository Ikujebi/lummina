"use client";

import { useEffect, useState } from "react";
import { Spin, Card, Tag } from "antd";

type Payment = {
  id: string;
  hours: number;
  note?: string;
  createdAt: string;
  matter: {
    title: string;
  };
};

interface Props {
  userId: string;
}

export default function ClientPayments({ userId }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    fetch(`/api/admin/users/${userId}/payments`)
      .then((res) => res.json())
      .then((res) => setPayments(res.payments || []))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {payments.map((p) => (
        <Card key={p.id} className="shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{p.matter?.title}</h3>
              {p.note && (
                <p className="text-sm text-gray-500 mt-1">{p.note}</p>
              )}
            </div>

            <div className="text-right">
              <Tag color="green">{p.hours} hrs</Tag>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(p.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      ))}

      {payments.length === 0 && (
        <p className="text-gray-500 text-sm">No billing records found</p>
      )}
    </div>
  );
}