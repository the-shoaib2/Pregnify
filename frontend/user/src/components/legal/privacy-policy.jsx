import React from "react";
import { LegalLayout } from "./layout"

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your data"
    >
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information that you provide directly to us, including but not limited
              to your name, email address, and any other information you choose to provide.
            </p>
            <ul className="mt-4 list-disc pl-6 text-muted-foreground">
              <li>Account information (email, password)</li>
              <li>Profile information (name, photo)</li>
              <li>Usage data and preferences</li>
              <li>Device and browser information</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services,
              to communicate with you, and to protect our services and users.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not share your personal information with third parties except as described
              in this privacy policy. We may share your information with service providers who
              assist us in providing our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">4. Data Security</h2>
            <p className="text-muted-foreground">
              We take reasonable measures to help protect information about you from loss,
              theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information. You
              can also choose to opt-out of certain communications from us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">6. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any
              changes by posting the new privacy policy on this page.
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