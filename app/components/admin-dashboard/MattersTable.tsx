import { Matter } from "@/types/admin";

export default function MattersTable({ matters }: { matters: Matter[] }) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow">
      <h2 className="font-semibold mb-4">Cases / Matters</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Lawyer</th>
            <th>Client</th>
          </tr>
        </thead>
        <tbody>
          {matters.map((matter) => (
            <tr key={matter.id}>
              <td>{matter.title}</td>
              <td>{matter.status}</td>
              <td>{matter.lawyer}</td>
              <td>{matter.client}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}