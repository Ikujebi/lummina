"use client";

import { Modal, Select, Button, Tag, Divider } from "antd";
import { useState } from "react";
import type { Case } from "@/types/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onClose: () => void;
  matter: Case | null;
  onUpdated?: (payload: Partial<Case>) => void;
};

const allStatuses: Case["status"][] = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "PENDING_CLOSURE",
  "CLOSED",
];

export default function MatterActionModal({
  open,
  onClose,
  matter,
}: Props) {
  const [status, setStatus] = useState<Case["status"] | undefined>();

  const queryClient = useQueryClient();

  // =========================
  // MUTATION
  // =========================
  const updateCase = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Case["status"];
    }) => {
      const res = await fetch("/api/admin/matters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update matter");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  // =========================
  // RESET STATE ON OPEN
  // =========================
  const handleAfterOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setStatus(undefined);
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================
  function handleClose() {
    setStatus(undefined);
    onClose();
  }

  // =========================
  // UPDATE STATUS
  // =========================
  async function updateStatus() {
    if (!matter || !status) return;

    await updateCase.mutateAsync({
      id: matter.id,
      status,
    });

    handleClose();
  }

  // =========================
  // AVAILABLE OPTIONS (ADMIN FLEX)
  // =========================
  const availableStatuses = matter
    ? allStatuses.filter((s) => s !== matter.status)
    : [];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      afterOpenChange={handleAfterOpenChange}
      title="Matter Action Workspace"
      footer={null}
      destroyOnHidden
    >
      {!matter ? (
        <div>No matter selected</div>
      ) : (
        <div className="space-y-4">
          {/* HEADER */}
          <div>
            <h3 className="font-semibold text-[#5F021F]">
              {matter.title}
            </h3>

            <p className="text-sm text-gray-500">
              {matter.description || "No description"}
            </p>

            <Tag color="gold">{matter.status}</Tag>
          </div>

          <Divider />

          {/* STATUS SELECT */}
          <div>
            <label className="text-sm text-gray-600">
              Change Status
            </label>

            <Select
              className="w-full mt-2"
              value={status}
              onChange={setStatus}
              placeholder="Select status"
              options={availableStatuses.map((s) => ({
                value: s,
                label: s,
              }))}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleClose}>
              Cancel
            </Button>

            <Button
              type="primary"
              disabled={!status}
              loading={updateCase.isPending}
              onClick={updateStatus}
              style={{
                backgroundColor: "#5F021F",
                borderColor: "#5F021F",
                color: "#fff",
              }}
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}