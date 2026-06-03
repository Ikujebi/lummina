import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default async function DocumentDetailsPage({
  params,
}: Props) {
  const { id } = params;

  const document = await prisma.document.findUnique({
    where: { id },

    include: {
      matter: true,

      // ✅ FIXED: correct relation name
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      versions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {document.name}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Document ID: {document.id}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">
            Document Information
          </h2>

          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Status:</span>{" "}
              {document.status}
            </p>

            <p>
              <span className="font-medium">Case Number:</span>{" "}
              {document.matter?.caseNumber ?? "N/A"}
            </p>

            <p>
              <span className="font-medium">Uploaded:</span>{" "}
              {new Date(document.createdAt).toLocaleDateString()}
            </p>

            <p>
              <span className="font-medium">File Size:</span>{" "}
              {document.fileSize
                ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB`
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">
            Lawyer Information
          </h2>

          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {document.uploader?.name ?? "N/A"}
            </p>

            <p>
              <span className="font-medium">Email:</span>{" "}
              {document.uploader?.email ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">
          Document Preview
        </h2>

        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-lg bg-black px-4 py-2 text-white"
        >
          Open Document
        </a>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">
          Version History
        </h2>

        {document.versions.length ? (
          <div className="space-y-3">
            {document.versions.map((version) => (
              <div
                key={version.id}
                className="rounded-lg border p-3"
              >
                <p className="font-medium">
                  Version {version.version}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(version.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No version history available.
          </p>
        )}
      </div>
    </div>
  );
}