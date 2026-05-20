"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  LawyerMatterDetail,
  MatterActivity,
  ActivityType,
  Visibility,
} from "@/types/lawyer";

import TabButton from "@/app/components/lawyer-dashboard/TabButton";
import {
  FileText,
  Activity as ActivityIcon,
  MessageSquare,
  Loader2,
} from "lucide-react";

import {
  ConfigProvider,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Timeline,
  Typography,
} from "antd";

const { Text } = Typography;

type Tab = "overview" | "activity";

export default function MatterPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [matter, setMatter] = useState<LawyerMatterDetail | null>(null);
  const [action, setAction] = useState("");
  const [details, setDetails] = useState("");

  const [selectedType, setSelectedType] =
    useState<ActivityType>("FILING");
  const [visibility, setVisibility] =
    useState<Visibility>("CLIENT");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");

  // =========================
  // LOAD MATTER
  // =========================
  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await fetch(`/api/matters/${id}`);
        if (!res.ok) throw new Error("Failed to load matter");

        const data = await res.json();
        setMatter(data.matter);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // =========================
  // ADD ACTIVITY
  // =========================
  async function addActivity() {
    if (!action || !matter) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/matters/${id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          details,
          type: selectedType,
          visibility,
        }),
      });

      const data: { activity: MatterActivity } = await res.json();

      setMatter((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          activities: [data.activity, ...prev.activities],
        };
      });

      setAction("");
      setDetails("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // STATUS UPDATE
  // =========================
  async function updateStatus(value: string) {
    try {
      const res = await fetch("/api/matters", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: matter?.id,
          status: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setMatter(data.matter);
    } catch (err) {
      console.error(err);
    }
  }

  // =========================
  // LOADING STATES
  // =========================
  if (!id) {
    return <div className="text-red-500">Invalid route</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin w-4 h-4" />
        Loading matter...
      </div>
    );
  }

  if (!matter) {
    return <div className="text-red-500">Matter not found</div>;
  }

  // =========================
  // STATUS COLOR
  // =========================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "green";
      case "IN_PROGRESS":
        return "blue";
      case "PENDING":
        return "gold";
      case "PENDING_CLOSURE":
        return "orange";
      case "CLOSED":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5F021F",
          colorInfo: "#FFF4E0",
          colorSuccess: "#22C55E",
          colorWarning: "#faad14",
          borderRadius: 10,
        },
        components: {
          Select: {
            optionSelectedBg: "#FFF4E0",
            optionActiveBg: "#FFF4E0",
          },
        },
      }}
    >
      <div className="space-y-6">

        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#5F021F]">
            {matter.title}
          </h1>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>Matter: {matter.caseNumber}</span>
            <span>•</span>
            <span>Client: {matter.client.name}</span>
            <span>•</span>

            <Tag color={getStatusColor(matter.status)}>
              {matter.status}
            </Tag>
          </div>

          {/* STATUS CONTROL */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-gray-500">
              Update Matter Status:
            </span>

            <Select
              value={matter.status}
              style={{ width: 220 }}
              onChange={updateStatus}
              options={[
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "PENDING", label: "Pending" },
                {
                  value: "CLOSED",
                  label: "Request Closure",
                },
              ]}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b">

          <TabButton
            label="Overview"
            active={tab === "overview"}
            onClick={() => setTab("overview")}
            icon={<FileText size={16} />}
          />

          <TabButton
            label="Activity"
            active={tab === "activity"}
            onClick={() => setTab("activity")}
            icon={<ActivityIcon size={16} />}
          />

          <TabButton
            label="Chat"
            active={false}
            onClick={() =>
              router.push(`/client/matters/${id}/chat`)
            }
            icon={<MessageSquare size={16} />}
          />

        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="grid md:grid-cols-2 gap-4">

            <Card title="Case Summary">
              <Text>
                {matter.description ||
                  "No description available for this matter."}
              </Text>
            </Card>

            <Card style={{ background: "#FFF4E0" }}>
              <div className="space-y-2 text-sm">
                <p>Case No: {matter.caseNumber}</p>
                <p>Client: {matter.client.name}</p>
                <p>Status: {matter.status}</p>
              </div>
            </Card>

          </div>
        )}

        {/* ACTIVITY */}
        {tab === "activity" && (
          <div className="space-y-6">

            <Card title="Activity Timeline">

              <div className="flex gap-2 mb-4">

                <Select
                  value={selectedType}
                  onChange={setSelectedType}
                  size="small"
                  style={{ width: 120 }}
                  options={[
                    { value: "FILING", label: "Filing" },
                    { value: "COURT", label: "Court" },
                    { value: "CLIENT", label: "Client" },
                    { value: "INTERNAL", label: "Internal" },
                  ]}
                />

                <Select
                  value={visibility}
                  onChange={setVisibility}
                  size="small"
                  style={{ width: 120 }}
                  options={[
                    { value: "CLIENT", label: "Client" },
                    { value: "INTERNAL", label: "Internal" },
                  ]}
                />

              </div>

              <Input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What happened?"
              />

              <Input.TextArea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add details..."
                rows={4}
                style={{ marginTop: 10 }}
              />

              <div className="flex justify-end mt-3">
                <Button
                  type="primary"
                  loading={submitting}
                  onClick={addActivity}
                >
                  Add Activity
                </Button>
              </div>

            </Card>

            <Card title={`Timeline (${matter.activities.length})`}>

              <Timeline
                items={matter.activities.map((a) => ({
                  color: "#5F021F",
                  children: (
                    <Card size="small" style={{ marginBottom: 10 }}>

                      <div className="flex justify-between">
                        <strong style={{ color: "#5F021F" }}>
                          {a.action}
                        </strong>

                        <div className="flex gap-2">
                          <Tag color="#FFF4E0">{a.type}</Tag>
                          <Tag>{a.visibility}</Tag>
                        </div>
                      </div>

                      {a.details && (
                        <div
                          style={{
                            marginTop: 6,
                            color: "#666",
                          }}
                        >
                          {a.details}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 11,
                          color: "#999",
                          marginTop: 6,
                        }}
                      >
                        {new Date(a.createdAt).toLocaleString()}
                      </div>

                    </Card>
                  ),
                }))}
              />

            </Card>

          </div>
        )}

      </div>
    </ConfigProvider>
  );
}