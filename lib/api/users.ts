export async function approveUser(userId: string) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isApproved: true }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to approve user");
  }

  return data;
}

export async function deleteUser(userId: string) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to delete user");
  }

  return data;
}

export async function updateUser(user: {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}) {
  const res = await fetch(`/api/admin/users/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to update user");
  }

  return data;
}