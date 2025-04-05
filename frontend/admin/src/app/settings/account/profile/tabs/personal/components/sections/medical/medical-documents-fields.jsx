import { lazy } from 'react';
import ErrorBoundary from "@/components/error-boundary";

const MedicalReports = lazy(() => {
  return import("./components/medical-documents")
})

export default function MedicalDocuments({ documents, onUpload }) {

  return (
    <ErrorBoundary>
      <MedicalReports
        reports={documents}
        onAddReport={onUpload}
        loading={false}
      />
    </ErrorBoundary>
  );
}
