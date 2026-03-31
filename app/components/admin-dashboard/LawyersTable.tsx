import { Lawyer } from "@/types/admin";

export default function LawyersTable({ lawyers }: { lawyers: Lawyer[] }) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow">
      <h2 className="font-semibold mb-4">Lawyers</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
          </tr>
        </thead>
        <tbody>
          {lawyers.map((lawyer) => (
            <tr key={lawyer.id}>
              <td>{lawyer.name}</td>
              <td>{lawyer.email}</td>
              <td>{lawyer.specialization}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}