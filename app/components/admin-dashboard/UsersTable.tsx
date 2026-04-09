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
  onApprove: (userId: string) => void;
  onSave: (user: User) => void;
  onDelete: (userId: string) => void;
}

interface TableProps {
  users: User[];
  editingKey: string | null;
  editedUser: Partial<User>;
  isEditing: (user: User) => boolean;
  handleChange: <K extends keyof User>(field: K, value: User[K]) => void;
  edit: (user: User) => void;
  save: (id: string) => void;
  cancel: () => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

// --- Desktop Table Component ---
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
            <tr key={user.id} className="hover:bg-[#FFEAB3]">
              <td className="border p-2">
                {isEditing(user) ? (
                  <Input
                    value={editedUser.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={{ backgroundColor: "#FFF4E0" }}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="border p-2">
                {isEditing(user) ? (
                  <Input
                    value={editedUser.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={{ backgroundColor: "#FFF4E0" }}
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
                    style={{ backgroundColor: "#FFF4E0" }}
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
                        onClick={() => onApprove(user.id)}
                        icon={<CheckCircleOutlined />}
                        style={{ color: "green" }}
                      >
                        Approve
                      </Button>
                    )}
                    <Button onClick={() => edit(user)} icon={<EditOutlined />}>
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
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
                          width: "90%",
                          style: {
                            left: "5vw",
                            top: "20vh",
                            maxWidth: "90vw",
                          },
                          onOk() {
                            onDelete(user.id);
                          },
                        });
                      }}
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

// --- Mobile Cards Component ---
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
      <div
        key={user.id}
        className="bg-[#FFF4E0] p-4 mb-3 rounded shadow"
      >
        <div className="mb-2">
          <strong>Name:</strong>{" "}
          {isEditing(user) ? (
            <Input
              value={editedUser.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          ) : (
            user.name
          )}
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
              onClick={() => onApprove(user.id)}
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
                    icon: <ExclamationCircleOutlined style={{ color: "#FA8C16" }} />,
                    okText: "Yes",
                    okType: "danger",
                    cancelText: "No",
                    width: "90%",
                    style: { left: "5vw", top: "20vh", maxWidth: "90vw" },
                    onOk() {
                      onDelete(user.id);
                    },
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
    if (editedUser) {
      onSave({ ...editedUser, id } as User);
      setEditingKey(null);
      setEditedUser({});
    }
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