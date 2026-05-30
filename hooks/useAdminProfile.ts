"use client";

import { useEffect, useState } from "react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export function useAdminProfile() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch("/api/admin/profile", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile:", err);
      }
    }

    fetchAdmin();

    const handleProfileUpdate = async () => {
      try {
        const res = await fetch("/api/admin/profile", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error("Failed to refresh admin profile:", err);
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener(
        "profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  return admin;
}