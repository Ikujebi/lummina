"use client";

import { User } from "@/types/admin";
import {
  approveUser,
  deleteUser,
  updateUser,
} from "@/lib/api/users";

type SetUsers = React.Dispatch<React.SetStateAction<User[]>>;

export function useUserActions(setUsers: SetUsers) {
  const handleApprove = async (user: User) => {
    try {
      await approveUser(user.id);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isApproved: true }
            : u
        )
      );
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleSave = async (user: User) => {
    try {
      const res = await updateUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, ...user }
            : u
        )
      );

      console.log(res);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id);

      setUsers((prev) =>
        prev.filter((u) => u.id !== user.id)
      );
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return {
    handleApprove,
    handleSave,
    handleDelete,
  };
}