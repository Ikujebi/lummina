"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  Input,
  Tag,
  message,
  Spin,
  Tabs,
  Empty,
} from "antd";
import { User } from "@/types/admin";
import Image from "next/image";
import {
  CheckCircleOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ClientMatters from "@/app/components/admin-dashboard/client-profile/ClientMatters";
import ClientDocuments from "@/app/components/admin-dashboard/client-profile/ClientDocuments";
import ClientTimeline from "@/app/components/admin-dashboard/client-profile/ClientTimeline";
import ClientPayments from "@/app/components/admin-dashboard/client-profile/ClientPayments";

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [client, setClient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<Partial<User>>({});
  const [mattersCount, setMattersCount] = useState<number>(0);
const [documentsCount, setDocumentsCount] = useState<number>(0);
const [timelineCount, setTimelineCount] = useState<number>(0);

  useEffect(() => {
    fetchClient();
  }, [id]);

  async function fetchClient() {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch client");
      }

      setClient(data.user);
      setForm({
        phone: data.user.phone ?? "",
        address: data.user.address ?? "",
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load client profile");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: "phone" | "address", value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveChanges() {
    if (!client) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Update failed");
      }

      setClient(data.user);
      setIsEditing(false);

      message.success("Client updated successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" style={{ color: "#5F021F" }} />
      </div>
    );
  }

  if (!client) {
    return <p className="p-6">Client not found</p>;
  }

  return (
    <div className="space-y-6 text-[#5F021F]">
      {/* HEADER CARD */}
      <div className="bg-white rounded-xl p-6 shadow flex items-center gap-6">
        <Image
          src={client.profilePicture || "/images/default-avatar.png"}
          alt={client.name || "Client"}
          width={90}
          height={90}
          className="rounded-full object-cover"
        />

        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold">
            {client.name || "No name"}
          </h1>

          <p className="text-gray-600">{client.email}</p>

          <div className="flex items-center gap-3">
            {client.isApproved ? (
              <Tag icon={<CheckCircleOutlined />} color="green">
                Approved
              </Tag>
            ) : (
              <Tag color="orange">Pending</Tag>
            )}

            <span className="text-sm text-gray-500">
              Role: {client.role}
            </span>
          </div>
        </div>

        {/* EDIT BUTTON */}
        <div>
          {!isEditing ? (
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setIsEditing(false);
                setForm({
                  phone: client.phone ?? "",
                  address: client.address ?? "",
                });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="bg-white rounded-xl p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold">Client Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PHONE (editable only in edit mode) */}
          <div>
            <label className="text-sm text-gray-500">
              Phone Number
            </label>

            <Input
              value={form.phone || ""}
              disabled={!isEditing}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
            />
          </div>

          {/* ADDRESS (editable only in edit mode) */}
          <div>
            <label className="text-sm text-gray-500">
              Address
            </label>

            <Input
              value={form.address || ""}
              disabled={!isEditing}
              onChange={(e) =>
                handleChange("address", e.target.value)
              }
            />
          </div>

          {/* READ ONLY FIELDS */}
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <Input value={client.name || ""} disabled />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <Input value={client.email || ""} disabled />
          </div>
        </div>

        {/* SAVE */}
        {isEditing && (
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={saveChanges}
              style={{ backgroundColor: "#5F021F" }}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

{/* CLIENT INTELLIGENCE DASHBOARD */}
<div className="bg-white rounded-xl p-6 shadow">
  <h2 className="text-lg font-semibold mb-4">
    Client Activity
  </h2>

  <Tabs
    defaultActiveKey="matters"
    destroyOnHidden
    items={[
      {
        key: "matters",
        label: "Matters",
        children: <ClientMatters clientId={id} />,
      },
      {
        key: "documents",
        label: "Documents",
        children: <ClientDocuments clientId={id} />,
      },
      {
        key: "timeline",
        label: "Timeline",
        children: <ClientTimeline clientId={id} />,
      },
      {
        key: "payments",
        label: "Payments",
        children: (
          <Empty description="Payments module not available yet" />
        ),
      },
    ]}
  />
</div>
    </div>
  );
}