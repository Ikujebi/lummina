"use client";

import { useState } from "react";
import DesktopTable from "./DesktopTable";
import MobileCards from "./MobileCards";
import { User } from "@/types/admin";

interface Props {
  users: User[];
  onApprove: (user: User) => void;
  onSave: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({
  users,
  onApprove,
  onSave,
  onDelete,
}: Props) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  const isEditing = (user: User) => user.id === editingKey;

  const edit = (user: User) => {
    setEditingKey(user.id);
    setEditedUser({ ...user });
  };

  const save = (id: string) => {
    const original = users.find((u) => u.id === id);
    if (!original) return;

    onSave({
      ...original,
      ...editedUser,
    });

    setEditingKey(null);
    setEditedUser({});
  };

  const cancel = () => {
    setEditingKey(null);
    setEditedUser({});
  };

  const handleChange = <K extends keyof User>(
    field: K,
    value: User[K]
  ) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <DesktopTable
        users={users}
        editingKey={editingKey}
        editedUser={editedUser}
        isEditing={isEditing}
        handleChange={handleChange}
        edit={edit}
        save={save}
        cancel={cancel}
        onApprove={onApprove}
        onDelete={onDelete}
      />

      <MobileCards
        users={users}
        editingKey={editingKey}
        editedUser={editedUser}
        isEditing={isEditing}
        handleChange={handleChange}
        edit={edit}
        save={save}
        cancel={cancel}
        onApprove={onApprove}
        onDelete={onDelete}
      />
    </>
  );
}