"use client";

import { useState, useEffect } from "react";
import type { Case, Lawyer, MatterRequest } from "@/types/admin";
import { Select, Button, Divider } from "antd";
import MattersTable from "../../components/admin-dashboard/MattersTable";
import MatterActionModal from "../../components/admin-dashboard/MatterActionModal";
import { useCases } from "@/hooks/useCases";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import "./cases.css";

export default function CasesPage() {
  // =========================
  // REACT QUERY
  // =========================
  const { data: cases = [] } = useCases();
  const queryClient = useQueryClient();

  // =========================
  // LOCAL STATE
  // =========================
  const [requests, setRequests] = useState<MatterRequest[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyers, setSelectedLawyers] = useState<
    Record<string, string>
  >({});

  const [approveLoadingId, setApproveLoadingId] = useState<string | null>(null);
  const [rejectLoadingId, setRejectLoadingId] = useState<string | null>(null);

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // =========================
  // FETCH INITIAL DATA
  // =========================
  useEffect(() => {
    async function fetchData() {
      try {
        const [lawyersRes, requestsRes] = await Promise.all([
          fetch("/api/lawyers"),
          fetch("/api/admin/matter-requests"),
        ]);

        const lawyersJson = await lawyersRes.json();
        const requestsJson = await requestsRes.json();

        setLawyers(lawyersJson.lawyers || []);
        setRequests(requestsJson.requests || []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    }

    fetchData();
  }, []);

  // =========================
  // UPDATE CASE (FIXED ARCHITECTURE)
  // =========================
  type UpdateCasePayload = {
    id: string;
    data: Partial<Case>;
  };

  const updateCase = useMutation({
    mutationFn: async ({ id, data }: UpdateCasePayload) => {
      const res = await fetch("/api/admin/matters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  // =========================
  // MODAL HANDLER
  // =========================
  function openCaseModal(caseData: Case) {
    setSelectedCase(caseData);
    setModalOpen(true);
  }

  // =========================
  // APPROVE REQUEST
  // =========================
  const handleApproveRequest = async (
    requestId: string,
    lawyerId: string
  ) => {
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
        queryClient.invalidateQueries({ queryKey: ["cases"] });
        openCaseModal(data.matter);
      }

      setSelectedLawyers((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setApproveLoadingId(null);
    }
  };

  // =========================
  // REJECT REQUEST
  // =========================
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
    } catch (err) {
      console.error(err);
    } finally {
      setRejectLoadingId(null);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#5F021F]">
          Cases
        </h1>

        <Button
          type="primary"
          style={{ backgroundColor: "#5F021F", borderColor: "#5F021F" }}
        >
          Create Case
        </Button>
      </div>

      {/* REQUESTS */}
      <div className="bg-white rounded-2xl px-3 sm:px-6 py-4 shadow-sm border">
        <h2 className="text-base sm:text-lg font-semibold mb-3">
          Matter Requests ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending requests</p>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((request) => {
              const selectedLawyerId = selectedLawyers[request.id];

              return (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 border-b pb-4"
                >
                  <div>
                    <h3 className="font-medium text-[#5F021F]">
                      {request.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.description || "No description"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      placeholder="Assign lawyer"
                      value={selectedLawyerId}
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

                    <Button
                      type="primary"
                      loading={approveLoadingId === request.id}
                      disabled={!selectedLawyerId}
                      onClick={() =>
                        handleApproveRequest(request.id, selectedLawyerId!)
                      }
                      style={{ backgroundColor: "#5F021F" }}
                    >
                      Assign & Open
                    </Button>

                    <Button
                      danger
                      loading={rejectLoadingId === request.id}
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Reject
                    </Button>
                  </div>

                  <Divider />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <MattersTable cases={cases} onOpenCase={openCaseModal} />
      </div>

      {/* MODAL (NOW PROPERLY WIRES UPDATE CASE) */}
      <MatterActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        matter={selectedCase}
        onUpdated={(payload: Partial<Case>) => {
          if (!selectedCase) return;

          updateCase.mutate({
            id: selectedCase.id,
            data: payload,
          });
        }}
      />
    </div>
  );
}