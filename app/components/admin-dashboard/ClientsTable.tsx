import { Client } from "@/types/admin";

export default function ClientsTable({ clients }: { clients: Client[] }) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow">
      <h2 className="font-semibold mb-4">Clients</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}