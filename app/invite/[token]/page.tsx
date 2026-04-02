"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Invitation {
  id: string;
  email: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export default function InvitePage() {
  const { token } = useParams();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
        } else {
          setInvitation(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchInvitation();
  }, [token]);

  if (loading) return <p>Loading invitation...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-10">
      <h1>You have been invited as {invitation?.role}</h1>
      <p>Email: {invitation?.email}</p>

      {/* Signup form goes here */}
    </div>
  );
}