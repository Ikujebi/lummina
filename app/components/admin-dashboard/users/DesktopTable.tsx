"use client";

import { Button, Input, Tag } from "antd";
import { User } from "@/types/admin";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { confirmDeleteUser } from "./userActions";
import Link from "next/link";

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
  viewHref?: (user: User) => string;

}

export default function DesktopTable({
  users,
  editedUser,
  isEditing,
  handleChange,
  edit,
  save,
  cancel,
  onApprove,
  onDelete,
  viewHref
}: Props) {
  return (
    <div className="hidden md:block w-full overflow-x-auto">
      <div className="min-w-[700px] rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[#5F021F]/5 transition-colors"
              >
                {/* NAME */}
                <td className="p-4 font-medium text-gray-900">
                  {user.name}
                </td>

                {/* EMAIL */}
                <td className="p-4 text-gray-600">
                  {isEditing(user) ? (
                    <Input
                      value={editedUser.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value)
                      }
                      size="small"
                    />
                  ) : (
                    user.email
                  )}
                </td>

                {/* ROLE */}
                <td className="p-4 text-gray-600 capitalize">
                  {isEditing(user) ? (
                    <Input
                      value={editedUser.role}
                      onChange={(e) =>
                        handleChange(
                          "role",
                          e.target.value as User["role"]
                        )
                      }
                      size="small"
                    />
                  ) : (
                    user.role.toLowerCase()
                  )}
                </td>

                {/* STATUS */}
                <td className="p-4">
                  {user.isApproved ? (
                    <Tag
                      icon={<CheckCircleOutlined />}
                      className="border-[#5F021F] text-[#5F021F] bg-[#5F021F]/10"
                    >
                      Approved
                    </Tag>
                  ) : (
                    <Tag className="border-gray-300 text-gray-600 bg-gray-50">
                      Pending
                    </Tag>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-4">
                  {isEditing(user) ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => save(user.id)}
                        style={{ backgroundColor: "#5F021F" }}
                      >
                        Save
                      </Button>

                      <Button
                        icon={<CloseOutlined />}
                        onClick={cancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      {!user.isApproved && (
                        <Button
                          type="text"
                          icon={<CheckCircleOutlined />}
                          onClick={() => onApprove(user)}
                          className="text-[#5F021F] hover:bg-[#5F021F]/10"
                        />
                      )}

                      {viewHref && (
                        <Link href={viewHref(user)}>
                          <Button
                          type="text"
                            icon={<EyeOutlined />}
                          className="text-[#5F021F] hover:bg-[#5F021F]/10"
                          />

                           
                        </Link>
                      )}

                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => edit(user)}
                        className="text-[#5F021F] hover:bg-[#5F021F]/10"
                      />

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          confirmDeleteUser(user, onDelete)
                        }
                      />
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
}