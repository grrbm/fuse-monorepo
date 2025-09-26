import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Link href="/signup">
                  <Button isIconOnly variant="light" aria-label="Go back">
                    <Icon icon="lucide:arrow-left" className="text-lg" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
                  <p className="text-foreground-600">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
                  <p className="text-foreground-700 mb-4">
                    By accessing and using Fuse Health's services, you accept and agree to be bound by the terms and provision of this agreement.
                    These terms apply to all users of the service, including patients, healthcare providers, and administrators.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Service Description</h2>
                  <p className="text-foreground-700 mb-4">
                    Fuse Health provides a secure, HIPAA-compliant platform for managing healthcare information,
                    facilitating communication between patients and providers, and supporting healthcare delivery services.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
                  <h3 className="text-lg font-medium mb-2">Account Security</h3>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2 mb-4">
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Use strong passwords and enable multi-factor authentication</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>Log out of your account when using shared devices</li>
                  </ul>

                  <h3 className="text-lg font-medium mb-2">Appropriate Use</h3>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Use the service only for legitimate healthcare purposes</li>
                    <li>Provide accurate and complete information</li>
                    <li>Respect the privacy and confidentiality of other users</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Prohibited Activities</h2>
                  <p className="text-foreground-700 mb-4">Users may not:</p>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Share account credentials with unauthorized persons</li>
                    <li>Attempt to gain unauthorized access to other accounts or systems</li>
                    <li>Upload malicious content or attempt to compromise system security</li>
                    <li>Use the service for any illegal or unauthorized purpose</li>
                    <li>Interfere with or disrupt the service or servers</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Privacy and Data Protection</h2>
                  <p className="text-foreground-700 mb-4">
                    We are committed to protecting your privacy and complying with HIPAA regulations.
                    Your use of our service is also governed by our Privacy Policy and HIPAA Privacy Notice,
                    which are incorporated into these Terms by reference.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Service Availability</h2>
                  <p className="text-foreground-700 mb-4">
                    While we strive to maintain continuous service availability, we cannot guarantee uninterrupted access.
                    We reserve the right to modify, suspend, or discontinue the service with appropriate notice to users.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
                  <p className="text-foreground-700 mb-4">
                    This service is a tool to facilitate healthcare communication and record management.
                    It does not replace professional medical advice, diagnosis, or treatment.
                    Always seek the advice of your physician or other qualified health provider with any questions
                    you may have regarding a medical condition.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
                  <p className="text-foreground-700 mb-4">
                    We reserve the right to modify these terms at any time.
                    We will notify users of significant changes through the service or via email.
                    Continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
                  <p className="text-foreground-700">
                    If you have questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-2 text-foreground-700">
                    <p>Email: legal@fusehealth.com</p>
                    <p>Phone: 1-800-SUPPORT</p>
                    <p>Address: [Your Business Address]</p>
                  </div>
                </section>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}