interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentDetailsPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Document Details
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Document ID: {id}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          You can display:
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Document title</li>
          <li>Preview link</li>
          <li>Case number</li>
          <li>Lawyer information</li>
          <li>Upload date</li>
          <li>File size</li>
          <li>Version history</li>
        </ul>
      </div>
    </div>
  );
}