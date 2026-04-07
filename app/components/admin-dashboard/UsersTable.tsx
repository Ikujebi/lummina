import { User } from "@/types/admin";

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-4 sm:p-6 shadow">
      <h2 className="font-semibold mb-4 text-left text-lg sm:text-xl text-[#5F021F]">
        Users
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] table-auto border-collapse sm:table-fixed">
          {/* Desktop header */}
          <thead className="bg-[#FFF4E0]/20 text-[#5F021F]/90 sticky top-0">
            <tr className="hidden sm:table-row">
              <th className="text-left pl-4 py-2 text-sm sm:text-base">Name</th>
              <th className="text-left px-4 py-2 text-sm sm:text-base">
                Email
              </th>
              <th className="text-left px-4 py-2 text-sm sm:text-base">Role</th>
            </tr>
          </thead>

          <tbody className="block sm:table-row-group">
            {users.map((user, idx) => (
             <tr
  key={user.id}
  className={`block sm:table-row mb-4 sm:mb-0 rounded-lg shadow ${
    idx % 2 === 0 ? "bg-[#FFF7E0]" : "bg-[#FFF4E0]"
  } sm:bg-transparent`}
>
  {/* Mobile card view */}
  <td className="block sm:table-cell pl-4 py-3 px-4 text-sm sm:text-base truncate max-w-[150px] mb-2 sm:mb-0">
    <span className="sm:hidden font-semibold">Name: </span>
    {user.name}
  </td>
  <td className="block sm:table-cell px-4 py-3 text-sm sm:text-base truncate max-w-[200px] mb-2 sm:mb-0">
    <span className="sm:hidden font-semibold">Email: </span>
    {user.email}
  </td>
  <td className="block sm:table-cell px-4 py-3 text-sm sm:text-base">
    <span className="sm:hidden font-semibold">Role: </span>
    {user.role}
  </td>
</tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-center text-[#5F021F]/70 mt-4 text-sm sm:text-base">
          No users found.
        </p>
      )}
    </section>
  );
}
