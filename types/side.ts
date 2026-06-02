import { ReactNode } from "react";

export interface MenuItem {
  label: string;
  icon: string | ReactNode;
  href?: string;
  isLogout?: boolean;
}