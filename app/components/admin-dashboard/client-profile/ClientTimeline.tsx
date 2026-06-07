"use client";

import { useEffect, useState } from "react";
import { Timeline, Spin, Empty } from "antd";

type Event = {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
};

export default function ClientTimeline({
  clientId,
}: {
  clientId: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${clientId}/timeline`)
      .then((res) => res.json())
      .then((data) =>
        setEvents(data.timeline ?? [])
      )
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <Spin />;

  if (!events.length) {
    return <Empty description="No activity found" />;
  }

  return (
    <Timeline
      items={events.map((event) => ({
        children: (
          <div>
            <p className="font-medium">
              {event.action}
            </p>

            {event.details && (
              <p className="text-gray-500 text-sm">
                {event.details}
              </p>
            )}

            <p className="text-xs text-gray-400">
              {new Date(
                event.createdAt
              ).toLocaleString()}
            </p>
          </div>
        ),
      }))}
    />
  );
}