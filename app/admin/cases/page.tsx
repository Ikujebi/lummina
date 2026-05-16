"use client";

import { useEffect, useState } from "react";
import type { Case, Lawyer, Client, MatterRequest } from "@/types/admin";
import { Select, Button, Divider } from "antd";
import MattersTable from "../../components/admin-dashboard/MattersTable";
import "./cases.css";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [requests, setRequests] = useState<MatterRequest[]>([]);
  const [search] = useState("");
  const [statusFilter] = useState<Case["status"] | "ALL">("ALL");

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyers, setSelectedLawyers] = useState<
    Record<string, string>
  >({});

  const [approveLoadingId, setApproveLoadingId] = useState<string | null>(null);
  const [rejectLoadingId, setRejectLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
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

      setCases(casesJson || []);
      setLawyers(lawyersJson.lawyers || []);
      setRequests(requestsJson.requests || []);
    }

    fetchData();
  }, []);

  const handleApproveRequest = async (requestId: string, lawyerId: string) => {
    setApproveLoadingId(requestId);

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

      setRequests((prev) => prev.filter((r) => r.id !== requestId));

      if (data.matter) {
        setCases((prev) => [data.matter, ...prev]);
      }

      setSelectedLawyers((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } finally {
      setApproveLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setRejectLoadingId(requestId);

    try {
      const res = await fetch(
        `/api/admin/matter-requests/${requestId}/reject`,
        { method: "POST" }
      );

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } finally {
      setRejectLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-6">

      {/* HEADER (responsive stack) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#5F021F]">
          Cases
        </h1>

        <Button
          type="primary"
          style={{ backgroundColor: "#5F021F", borderColor: "#5F021F" }}
          className="w-full sm:w-auto"
        >
          Create Case
        </Button>
      </div>

      {/* REQUESTS CARD */}
      <div className="bg-white rounded-2xl px-3 sm:px-6 py-4 shadow-sm border">

        <h2 className="text-base sm:text-lg font-semibold mb-3">
          Matter Requests ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending requests</p>
        ) : (
          <div className="flex flex-col gap-4">

            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 border-b pb-4"
              >
                {/* TEXT */}
                <div>
                  <h3 className="font-medium text-[#5F021F]">
                    {request.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {request.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Client: {request.client?.name ?? "Unknown"}
                  </p>
                </div>

                {/* CONTROLS (STACK ON MOBILE) */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">

                  <Select
                    placeholder="Assign lawyer"
                    value={selectedLawyers[request.id]}
                    onChange={(value) =>
                      setSelectedLawyers((prev) => ({
                        ...prev,
                        [request.id]: value,
                      }))
                    }
                    options={lawyers.map((l) => ({
                      value: l.id,
                      label: l.name,
                    }))}
                    className="w-full sm:w-64"
                  />

                  <div className="flex gap-2 w-full sm:w-auto">

                    <Button
                      type="primary"
                      loading={approveLoadingId === request.id}
                      disabled={!selectedLawyers[request.id]}
                      onClick={() =>
                        handleApproveRequest(
                          request.id,
                          selectedLawyers[request.id]
                        )
                      }
                      style={{
                        backgroundColor: "#5F021F",
                        borderColor: "#5F021F",
                        flex: 1,
                      }}
                    >
                      Assign
                    </Button>

                    <Button
                      danger
                      loading={rejectLoadingId === request.id}
                      onClick={() => handleRejectRequest(request.id)}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </Button>

                  </div>
                </div>

                <Divider style={{ margin: 0 }} />
              </div>
            ))}

          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <MattersTable cases={cases} />
      </div>
    </div>
  );
}