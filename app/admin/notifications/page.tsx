"use client";

import { useEffect, useState } from "react";
import { Table, Spin } from "antd";

interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  createdAt: string;
}

export default function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/audit-logs");
        const data: AuditLog[] = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const columns = [
    { title: "User", dataIndex: "user", key: "user" },
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "Entity", dataIndex: "entity", key: "entity" },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={logs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Spin>
  );
}