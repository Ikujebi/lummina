"use client";

import { useRouter } from "next/navigation";
import { Table, Tag, Button, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Case } from "@/types/admin";

const BRAND = "#5F021F";
const ACCENT = "#FFD6A5";

type SafeUser =
  | {
      id?: string;
      name?: string;
    }
  | string
  | null;

type Props = {
  cases: Case[];
  onOpenCase?: (caseData: Case) => void; // modal (status)
};

export default function MattersTable({ cases, onOpenCase }: Props) {
  const router = useRouter();

  const getName = (value: SafeUser) => {
    if (!value) return "—";
    if (typeof value === "string") return value;
    return value.name ?? "—";
  };

  const columns: ColumnsType<Case> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (value) => value ?? "—",
    },
    {
      title: "Lawyer",
      dataIndex: "lawyer",
      key: "lawyer",
      render: (lawyer) => getName(lawyer),
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => getName(client),
    },
    {
      title: "Case Number",
      dataIndex: "caseNumber",
      key: "caseNumber",
      render: (value) => value ?? "—",
    },

    // =========================
    // STATUS COLUMN (OPEN MODAL)
    // =========================
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => (
        <Tag
          style={{ cursor: "pointer" }}
          color={
            status === "OPEN"
              ? "green"
              : status === "PENDING"
              ? "orange"
              : "red"
          }
          onClick={() => {
            console.log("STATUS CLICKED:", record.id);
            onOpenCase?.(record);
          }}
        >
          {status?.replace("_", " ") ?? "—"}
        </Tag>
      ),
    },

    // =========================
    // CHAT ACTION (SEPARATE)
    // =========================
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Button
            type="primary"
            style={{ background: BRAND, borderColor: BRAND }}
            onClick={() => {
              console.log("CHAT CLICKED:", record.id);
              router.push(`/chat/${record.id}`);
            }}
          >
            Open Chat
          </Button>
        );
      },
    },
  ];

  return (
    <div
      style={{
        border: "1px solid rgba(95,2,31,0.2)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: ACCENT,
          padding: 12,
          fontWeight: 600,
          color: BRAND,
        }}
      >
        Matters Overview
      </div>

      <Table
        dataSource={cases}
        columns={columns}
        rowKey={(record) => record.id}
        locale={{
          emptyText: <Empty description="No cases found" />,
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}