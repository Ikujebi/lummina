export type User = {
  id: string;
  name: string | null;
  email: string;
  profilePicture?: string | null;
  role: "ADMIN" | "LAWYER" | "CLIENT";
};