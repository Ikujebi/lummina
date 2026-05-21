"use client";

import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { User } from "@/types/admin";
import {
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { confirm } = Modal;

interface UsersTableProps {
  users: User[];
  onApprove: (user: User) => void;
  onSave: (user: User) => void;
  onDelete: (user: User) => void;
}

// --- Desktop Table Component ---
interface TableProps {
  users: User[];
  editingKey: string | null;
  editedUser: Partial<User>;
  isEditing: (user: User) => boolean;
  handleChange: <K extends keyof User>(field: K, value: User[K]) => void;
  edit: (user: User) => void;
  save: (id: string) => void;
  cancel: () => void;
  onApprove: (user: User) => void;
  onDelete: (user: User) => void;
}

const DesktopTable: React.FC<TableProps> = ({
  users,
  editedUser,
  isEditing,
  handleChange,
  edit,
  save,
  cancel,
  onApprove,
  onDelete,
}) => (
  <div className="hidden md:block w-full overflow-x-auto">
    <div className="min-w-[600px]">
      <table className="w-full border border-[#FFF4E0] bg-[#FFF4E0]">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              data-testid={`user-row-${user.id}`}
              className="hover:bg-[#FFEAB3]"
            >
              <td className="border p-2">{user.name}</td>

              <td className="border p-2">
                {isEditing(user) ? (
                  <Input
                    value={editedUser.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                ) : (
                  user.email
                )}
              </td>

              <td className="border p-2">
                {isEditing(user) ? (
                  <Input
                    value={editedUser.role}
                    onChange={(e) =>
                      handleChange("role", e.target.value as User["role"])
                    }
                  />
                ) : (
                  user.role
                )}
              </td>

              <td className="border p-2">
                {isEditing(user) ? (
                  <div className="flex gap-2">
                    <Button onClick={() => save(user.id)}>Save</Button>
                    <Button onClick={cancel}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {!user.isApproved && (
                      <Button
                        onClick={() => onApprove(user)}
                        icon={<CheckCircleOutlined />}
                        style={{ color: "green" }}
                      >
                        Approve
                      </Button>
                    )}

                    <Button
                      onClick={() => edit(user)}
                      icon={<EditOutlined />}
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() =>
                        confirm({
                          title: "Are you sure you want to delete this user?",
                          icon: (
                            <ExclamationCircleOutlined
                              style={{ color: "#FA8C16" }}
                            />
                          ),
                          okText: "Yes",
                          okType: "danger",
                          cancelText: "No",
                          onOk: () => onDelete(user),
                        })
                      }
                      icon={<DeleteOutlined />}
                      style={{ color: "red" }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Mobile Cards ---
const MobileCards: React.FC<TableProps> = ({
  users,
  editedUser,
  isEditing,
  handleChange,
  edit,
  save,
  cancel,
  onApprove,
  onDelete,
}) => (
  <div className="block md:hidden w-full max-w-[400px] mx-auto">
    {users.map((user) => (
      <div key={user.id} className="bg-[#FFF4E0] p-4 mb-3 rounded shadow">
        <div className="mb-2">
          <strong>Name:</strong> {user.name}
        </div>

        <div className="mb-2">
          <strong>Email:</strong>{" "}
          {isEditing(user) ? (
            <Input
              value={editedUser.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          ) : (
            user.email
          )}
        </div>

        <div className="mb-2">
          <strong>Role:</strong>{" "}
          {isEditing(user) ? (
            <Input
              value={editedUser.role}
              onChange={(e) =>
                handleChange("role", e.target.value as User["role"])
              }
            />
          ) : (
            user.role
          )}
        </div>

        <div className="flex gap-2 flex-wrap mt-2">
          {!user.isApproved && (
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => onApprove(user)}
              style={{ color: "green" }}
            >
              Approve
            </Button>
          )}

          {isEditing(user) ? (
            <>
              <Button onClick={() => save(user.id)}>Save</Button>
              <Button onClick={cancel}>Cancel</Button>
            </>
          ) : (
            <>
              <Button icon={<EditOutlined />} onClick={() => edit(user)}>
                Edit
              </Button>

              <Button
                icon={<DeleteOutlined />}
                onClick={() =>
                  confirm({
                    title: "Are you sure you want to delete this user?",
                    icon: (
                      <ExclamationCircleOutlined
                        style={{ color: "#FA8C16" }}
                      />
                    ),
                    okText: "Yes",
                    okType: "danger",
                    cancelText: "No",
                    onOk: () => onDelete(user),
                  })
                }
                style={{ color: "red" }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    ))}
  </div>
);

// --- MAIN COMPONENT ---
export default function UsersTable({
  users,
  onApprove,
  onSave,
  onDelete,
}: UsersTableProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  const isEditing = (record: User) => record.id === editingKey;

  const edit = (record: User) => {
    setEditingKey(record.id);
    setEditedUser({ ...record });
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

  const handleChange = <K extends keyof User>(field: K, value: User[K]) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
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