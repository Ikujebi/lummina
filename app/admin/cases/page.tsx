"use client";

import { useEffect, useState } from "react";
import type { Case } from "@/types/admin";
import { Select, Tag, Modal, Form, Input, Button } from "antd";

const { Option } = Select;

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Case["status"] | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  // For lawyer/client selection
  const [lawyers, setLawyers] = useState<{ name: string }[]>([]);
  const [clients, setClients] = useState<{ name: string }[]>([]);

  // Fetch cases and users
  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch("/api/admin/matters");
        const data: Case[] = await res.json();
        setCases(data);

        // Extract unique lawyers and clients
        const lawyerSet = new Set(data.map((c) => c.lawyer));
        const clientSet = new Set(data.map((c) => c.client));
        setLawyers(Array.from(lawyerSet).map((name) => ({ name })));
        setClients(Array.from(clientSet).map((name) => ({ name })));
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      }
    }
    fetchCases();
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

  const statusColors: Record<Case["status"] | "ALL", string> = {
    ALL: "default",
    OPEN: "green",
    IN_PROGRESS: "orange",
    CLOSED: "red",
  };

  const handleCreateCase = async (values: {
    title: string;
    lawyer: string;
    client: string;
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
          onChange={(value: string) => setStatusFilter(value as Case["status"] | "ALL")}
          placeholder="Select Status"
          size="middle"
          className="w-full sm:w-48 rounded-xl !bg-[#F7E7CE] !border !border-[#5F021F] text-sm sm:text-base"
          classNames={{ popup: { root: "rounded-xl shadow-lg !bg-[#F7E7CE]" } }}
          optionLabelProp="label"
          options={[
            { value: "ALL", label: <Tag color="default">All Statuses</Tag> },
            { value: "OPEN", label: <Tag color="green">Open</Tag> },
            { value: "IN_PROGRESS", label: <Tag color="orange">In Progress</Tag> },
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
                <td
                  className={`px-4 py-3 border font-semibold ${
                    c.status === "OPEN"
                      ? "text-green-600"
                      : c.status === "IN_PROGRESS"
                      ? "text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {c.status.replace("_", " ")}
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
            rules={[{ required: true, message: "Please enter case title" }]}
          >
            <Input placeholder="Enter case title" />
          </Form.Item>

          {/* Lawyer Select */}
          <Form.Item name="lawyer" label="Lawyer" rules={[{ required: true, message: "Please select a lawyer" }]}>
            <Select
              showSearch
              placeholder="Select lawyer"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={lawyers.map((l) => ({ value: l.name, label: l.name }))}
            />
          </Form.Item>

          {/* Client Select */}
          <Form.Item name="client" label="Client" rules={[{ required: true, message: "Please select a client" }]}>
            <Select
              showSearch
              placeholder="Select client"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={clients.map((c) => ({ value: c.name, label: c.name }))}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select case status" }]}
          >
            <Select placeholder="Select status">
              <Option value="OPEN">Open</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
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