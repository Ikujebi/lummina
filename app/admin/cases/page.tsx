"use client";

import { useEffect, useState } from "react";
import type { Case, Lawyer, Client, MatterRequest } from "@/types/admin";

import { Select, Tag, Modal, Form, Input, Button } from "antd";

import MattersTable from "../../components/admin-dashboard/MattersTable";
import "./cases.css";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [requests, setRequests] = useState<MatterRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<Case["status"] | "ALL">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  const [selectedLawyers, setSelectedLawyers] = useState<
    Record<string, string>
  >({});

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    async function fetchData() {
      try {
        const [casesRes, lawyersRes, clientsRes, requestsRes] =
          await Promise.all([
            fetch("/api/admin/matters"),
            fetch("/api/lawyers"),
            fetch("/api/admin/clients"),
            fetch("/api/admin/matter-requests"),
          ]);

        const casesJson = await casesRes.json();
        const lawyersJson = await lawyersRes.json();
        const clientsJson = await clientsRes.json();
        const requestsJson = await requestsRes.json();

        // ✅ FIX: backend returns array, not { matters: [] }
        setCases(casesJson || []);

        setLawyers(lawyersJson.lawyers || []);
        setClients(clientsJson.clients || []);
        setRequests(requestsJson.requests || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchData();
  }, []);

  // =========================
  // FILTER CASES
  // =========================
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      (c.title?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (c.caseNumber?.toLowerCase() ?? "").includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // CREATE CASE
  // =========================
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
        body: JSON.stringify({
          title: values.title,
          lawyerId: values.lawyer,
          clientId: values.client,
          status: values.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // ✅ FIX: use data.matter
      setCases((prev) => [data.matter, ...prev]);

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Create case error:", error);
    }
  };

  // =========================
  // APPROVE REQUEST
  // =========================
  const handleApproveRequest = async (
    requestId: string,
    lawyerId: string
  ) => {
    setLoadingRequestId(requestId);

    try {
      const res = await fetch(
        `/api/admin/matter-requests/${requestId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lawyerId }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setRequests((prev) =>
        prev.filter((r) => r.id !== requestId)
      );

      if (data.matter) {
        setCases((prev) => [data.matter, ...prev]);
      }

      setSelectedLawyers((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setLoadingRequestId(null);
    }
  };

  // =========================
  // REJECT REQUEST
  // =========================
  const handleRejectRequest = async (requestId: string) => {
    setLoadingRequestId(requestId);

    try {
      const res = await fetch(
        `/api/admin/matter-requests/${requestId}/reject`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setRequests((prev) =>
        prev.filter((r) => r.id !== requestId)
      );
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setLoadingRequestId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-semibold text-[#5F021F]">
          Cases
        </h1>

        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: "#5F021F",
            borderColor: "#5F021F",
          }}
        >
          Create Case
        </Button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Search cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
        />

        <Select
          value={statusFilter}
          onChange={(value) =>
            setStatusFilter(value as Case["status"] | "ALL")
          }
          className="w-full sm:w-48"
          options={[
            { value: "ALL", label: <Tag>All</Tag> },
            { value: "OPEN", label: <Tag color="green">Open</Tag> },
            { value: "IN_PROGRESS", label: <Tag color="orange">In Progress</Tag> },
            { value: "CLOSED", label: <Tag color="red">Closed</Tag> },
          ]}
        />
      </div>

      {/* REQUESTS */}
      <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Matter Requests
      </h2>
      <p className="text-sm text-gray-500">
        Review and assign incoming requests
      </p>
    </div>

    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full ">
      {requests.length}
    </div>
  </div>

  {/* EMPTY STATE */}
  {requests.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-gray-400 text-sm">
        No pending requests
      </div>
    </div>
  ) : (
    <div className="divide-y">

      {requests.map((request) => {
        const data = request.data || {};

        return (
          <div
            key={request.id}
            className="py-5 px-2 flex flex-col gap-3 shadow-md bg-[#F7e7ce]/10"
          >

            {/* TITLE + META */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">
                  {data.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {data.description}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Client: {request.client?.name ?? "Unknown client"}
                </p>
              </div>
            </div>

            {/* ACTION ROW */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

              {/* SELECT */}
              <div className="w-full sm:w-64">
                <Select
                  placeholder="Assign lawyer"
                  style={{ borderColor: "#5F021F" }}
                  value={selectedLawyers[request.id]}
                  onChange={(lawyerId) =>
                    setSelectedLawyers((prev) => ({
                      ...prev,
                      [request.id]: lawyerId,
                    }))
                  }
                  className="w-full"
                  options={lawyers.map((l) => ({
                    value: l.id,
                    label: l.name,
                  }))}
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2">

                <Button
                  type="primary"
                  disabled={!selectedLawyers[request.id]}
                  loading={loadingRequestId === request.id}
                  onClick={() =>
                    handleApproveRequest(
                      request.id,
                      selectedLawyers[request.id]
                    )
                  }
                  style={{
                    backgroundColor: "#5F021F",
                    borderColor: "#5F021F",
                    color: "#fff",
                  }}
                >
                  Assign
                </Button>

                <Button
                  type="text"
                  danger
                  onClick={() => handleRejectRequest(request.id)}
                  loading={loadingRequestId === request.id}
                >
                  Reject
                </Button>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  )}
</div>

      {/* TABLE */}
      <MattersTable cases={filteredCases} />

      {/* CREATE MODAL */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title="Create Case"
      >
        <Form form={form} onFinish={handleCreateCase} layout="vertical">

          <Form.Item name="title" label="Title" required>
            <Input />
          </Form.Item>

          <Form.Item name="lawyer" label="Lawyer" required>
            <Select options={lawyers.map(l => ({
              value: l.id,
              label: l.name
            }))} />
          </Form.Item>

          <Form.Item name="client" label="Client" required>
            <Select options={clients.map(c => ({
              value: c.id,
              label: c.name
            }))} />
          </Form.Item>

          <Form.Item name="status" label="Status" required>
            <Select options={[
              { value: "OPEN", label: "Open" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "CLOSED", label: "Closed" }
            ]} />
          </Form.Item>

          <Button htmlType="submit" type="primary" block>
            Create Case
          </Button>

        </Form>
      </Modal>

    </div>
  );
}