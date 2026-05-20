"use client";

import { useEffect, useState } from "react";
import { Table, Spin, Tag, Typography } from "antd";

const { Text } = Typography;

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
        const data = await res.json();

        setLogs(data || []);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: string) => (
        <Text strong>{user || "System"}</Text>
      ),
    },

    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        let color = "default";

        if (action.includes("CLOSE")) color = "red";
        if (action.includes("ASSIGN")) color = "blue";
        if (action.includes("CREATE")) color = "green";
        if (action.includes("UPDATE")) color = "orange";

        return <Tag color={color}>{action}</Tag>;
      },
    },

    {
      title: "Entity",
      dataIndex: "entity",
      key: "entity",
      render: (entity: string) => (
        <Tag color="geekblue">{entity}</Tag>
      ),
    },

    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) =>
        text ? new Date(text).toLocaleString() : "-",
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={logs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: "No audit logs available",
        }}
      />
    </Spin>
  );
}