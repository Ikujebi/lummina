"use client";

import { useMemo, useState } from "react";

/* =========================
   PASSWORD STRENGTH
========================= */
function getStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;

  if (/[A-Z]/.test(password)) score++;

  if (/[0-9]/.test(password)) score++;

  if (/[^A-Za-z0-9]/.test(password))
    score++;

  return score;
}

export function usePassword() {
  const [passwords, setPasswords] =
    useState({
      current: "",
      new: "",
      confirm: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState({
      text: "",
      type: "",
    });

  /* =========================
     PASSWORD STRENGTH
  ========================= */
  const strength = useMemo(
    () => getStrength(passwords.new),
    [passwords.new]
  );

  /* =========================
     CHANGE PASSWORD
  ========================= */
  async function changePassword() {
    /* EMPTY FIELDS */
    if (
      !passwords.current ||
      !passwords.new ||
      !passwords.confirm
    ) {
      setMessage({
        text:
          "All password fields are required",
        type: "error",
      });

      return;
    }

    /* PASSWORD MATCH */
    if (
      passwords.new !==
      passwords.confirm
    ) {
      setMessage({
        text:
          "New passwords do not match",
        type: "error",
      });

      return;
    }

    /* PASSWORD STRENGTH */
    if (strength < 3) {
      setMessage({
        text: "Password is too weak",
        type: "error",
      });

      return;
    }

    try {
      setLoading(true);

      setMessage({
        text: "",
        type: "",
      });

      const res = await fetch(
        "/api/admin/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword:
              passwords.current,

            newPassword:
              passwords.new,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          data.error ||
            "Password change failed"
        );
      }

      setMessage({
        text:
          "Password changed successfully",
        type: "success",
      });

      /* RESET FORM */
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      /* OPTIONAL AUTO REDIRECT */
      localStorage.removeItem("isLoggedIn");
      setTimeout(() => {
        window.location.href =
          "/";
      }, 2000);

      return data;
    } catch (err) {
      console.error(err);

      setMessage({
        text:
          err instanceof Error
            ? err.message
            : "Password change failed",

        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    passwords,
    setPasswords,
    changePassword,
    loading,
    strength,
    message,
    setMessage,
  };
}