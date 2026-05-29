"use client";

import { Button, Input } from "antd";
import { User } from "@/types/admin";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { confirmDeleteUser } from "./userActions";

interface Props {
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

export default function MobileCards({
  users,
  editedUser,
  isEditing,
  handleChange,
  edit,
  save,
  cancel,
  onApprove,
  onDelete,
}: Props) {
  return (
    <div className="block md:hidden w-full max-w-[400px] mx-auto">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-[#FFF4E0] p-4 mb-3 rounded shadow"
        >
          <div className="mb-2">
            <strong>Name:</strong> {user.name}
          </div>

          <div className="mb-2">
            <strong>Email:</strong>{" "}
            {isEditing(user) ? (
              <Input
                value={editedUser.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
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
                  handleChange(
                    "role",
                    e.target.value as User["role"]
                  )
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
                <Button onClick={() => save(user.id)}>
                  Save
                </Button>
                <Button onClick={cancel}>Cancel</Button>
              </>
            ) : (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => edit(user)}
                >
                  Edit
                </Button>

                <Button
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    confirmDeleteUser(user, onDelete)
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
}