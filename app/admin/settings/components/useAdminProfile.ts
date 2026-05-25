"use client";

import { useEffect, useState } from "react";

import type { AdminProfile } from "@/types/adminProfile";

export function useAdminProfile() {
  const [profile, setProfile] =
    useState<AdminProfile>({
      id: "",
      name: "",
      email: "",
      profilePicture: "",
      profilePicturePublicId: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================
     FETCH PROFILE
  ========================= */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(
          "/api/admin/profile"
        );

        const data = await res.json();

        if (
          data.success &&
          data.admin
        ) {
          setProfile(data.admin);
        } else {
          setError(
            "Failed to load profile"
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return {
    profile,
    setProfile,
    loading,
    error,
  };
}