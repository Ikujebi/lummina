import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { User } from "@/types/admin";

const { confirm } = Modal;

export const confirmDeleteUser = (
  user: User,
  onDelete: (user: User) => void
) => {
  confirm({
    title: "Are you sure you want to delete this user?",
    icon: <ExclamationCircleOutlined style={{ color: "#FA8C16" }} />,
    okText: "Yes",
    okType: "danger",
    cancelText: "No",
    onOk: () => onDelete(user),
  });
};