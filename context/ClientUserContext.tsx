// context/ClientUserContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

import type { User } from "@/types/user";

type ClientUserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const ClientUserContext =
  createContext<ClientUserContextType | null>(null);

export function ClientUserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User;
}) {
  const [user, setUser] = useState(initialUser);

  return (
    <ClientUserContext.Provider
      value={{ user, setUser }}
    >
      {children}
    </ClientUserContext.Provider>
  );
}

export function useClientUser() {
  const ctx = useContext(ClientUserContext);

  if (!ctx) {
    throw new Error(
      "useClientUser must be used within ClientUserProvider"
    );
  }

  return ctx;
}