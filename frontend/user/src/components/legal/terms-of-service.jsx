import React from "react";
import { LegalLayout } from "./layout"

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Please read these terms carefully before using our service."
    >
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using this website, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please
              do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily download one copy of the materials (information
              or software) on this website for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title.
            </p>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">3. Disclaimer</h2>
            <p className="text-muted-foreground">
              The materials on this website are provided on an 'as is' basis. We make no
              warranties, expressed or implied, and hereby disclaim and negate all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">4. Limitations</h2>
            <p className="text-muted-foreground">
              In no event shall we or our suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on this
              website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">5. Revisions</h2>
            <p className="text-muted-foreground">
              We may revise these terms of service for this website at any time without notice.
              By using this website you are agreeing to be bound by the then current version of
              these terms of service.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
} 
