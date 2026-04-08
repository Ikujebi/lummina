"use client";

import { useEffect, useState } from "react";
import type { Case, Lawyer, Client } from "@/types/admin";
import { Select, Tag, Modal, Form, Input, Button } from "antd";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Case["status"] | "ALL">(
    "ALL",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  // ✅ Proper typing
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Fetch cases + lawyers + clients
  useEffect(() => {
    async function fetchData() {
      try {
        const [casesRes, lawyersRes, clientsRes] = await Promise.all([
          fetch("/api/admin/matters"),
          fetch("/api/admin/lawyers"),
          fetch("/api/admin/clients"),
        ]);

        const casesData: Case[] = await casesRes.json();
        const lawyersData: Lawyer[] = await lawyersRes.json();
        const clientsData: Client[] = await clientsRes.json();

        setCases(casesData);
        setLawyers(lawyersData);
        setClients(clientsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }

    fetchData();
  }, []);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      (c.title?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (c.lawyer?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (c.client?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (c.caseNumber?.toLowerCase() ?? "").includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateCase = async (values: {
    title: string;
    lawyer: string; // ✅ this will now be lawyerId
    client: string; // ✅ clientId
    status: Case["status"];
  }) => {
    try {
      const res = await fetch("/api/admin/matters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const newCase: Case = await res.json();
      setCases([newCase, ...cases]);
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      alert("Failed to create case");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#5F021F]">Cases</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: "#5F021F", borderColor: "#5F021F" }}
        >
          Create Case
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Search cases, lawyer, client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
        />

        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as Case["status"] | "ALL")}
          className="w-full sm:w-48"
          options={[
            { value: "ALL", label: <Tag>All</Tag> },
            { value: "OPEN", label: <Tag color="green">Open</Tag> },
            {
              value: "IN_PROGRESS",
              label: <Tag color="orange">In Progress</Tag>,
            },
            { value: "CLOSED", label: <Tag color="red">Closed</Tag> },
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow border border-[#5F021F]/20">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FFD6A5]">
            <tr>
              <th className="px-4 py-3 border">Title</th>
              <th className="px-4 py-3 border">Lawyer</th>
              <th className="px-4 py-3 border">Client</th>
              <th className="px-4 py-3 border">Case Number</th>
              <th className="px-4 py-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-[#FFE8B2]">
                <td className="px-4 py-3 border">{c.title}</td>
                <td className="px-4 py-3 border">{c.lawyer}</td>
                <td className="px-4 py-3 border">{c.client}</td>
                <td className="px-4 py-3 border">{c.caseNumber ?? "—"}</td>
                <td className="px-4 py-3 border font-semibold">
                  {typeof c.status === "string"
                    ? c.status.replace("_", " ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCases.length === 0 && (
          <p className="text-center p-4 text-[#5F021F]/70">No cases found.</p>
        )}
      </div>

      {/* Modal */}
      <Modal
        title="Create New Case"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCase}>
          <Form.Item
            name="title"
            label="Case Title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          {/* ✅ Lawyer Select */}
          <Form.Item name="lawyer" label="Lawyer" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={lawyers.map((l) => ({
                value: l.id,
                label: l.name,
              }))}
            />
          </Form.Item>

          {/* ✅ Client Select */}
          <Form.Item name="client" label="Client" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={clients.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Form.Item>

          {/* Status */}
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "CLOSED", label: "Closed" },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: "#5F021F", borderColor: "#5F021F" }}
            >
              Create Case
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
