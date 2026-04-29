import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}