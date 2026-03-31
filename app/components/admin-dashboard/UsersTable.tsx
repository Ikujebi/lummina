import { User } from "@/types/admin";

export default function UsersTable({ users }: { users: User[] }) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow">
      <h2 className="font-semibold mb-4">Users</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}