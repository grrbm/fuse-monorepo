import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
                  <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
                  <p className="text-foreground-600">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Information Collection and Use</h2>
                  <p className="text-foreground-700 mb-4">
                    Fuse Health is committed to protecting your privacy and ensuring the security of your personal health information (PHI).
                    We collect only the information necessary to provide you with quality healthcare services and maintain compliance with HIPAA regulations.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Types of Information We Collect</h2>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Personal identification information (name, email, phone number)</li>
                    <li>Healthcare information and medical records</li>
                    <li>Insurance and billing information</li>
                    <li>Device and usage information for service improvement</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">How We Protect Your Information</h2>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>End-to-end encryption for all data transmission</li>
                    <li>Secure, HIPAA-compliant data storage</li>
                    <li>Multi-factor authentication and access controls</li>
                    <li>Regular security audits and compliance monitoring</li>
                    <li>Employee training on privacy and security protocols</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Information Sharing</h2>
                  <p className="text-foreground-700 mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except as outlined in our
                    HIPAA Privacy Notice or as required by law. We may share information with:
                  </p>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Healthcare providers involved in your care</li>
                    <li>Insurance companies for billing purposes</li>
                    <li>Legal authorities when required by law</li>
                    <li>Service providers under strict confidentiality agreements</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                  <p className="text-foreground-700 mb-4">
                    Under HIPAA and applicable privacy laws, you have the right to:
                  </p>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Access and obtain copies of your health information</li>
                    <li>Request corrections to your health information</li>
                    <li>Request restrictions on use or disclosure of your information</li>
                    <li>Request confidential communications</li>
                    <li>File a complaint if you believe your privacy rights have been violated</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
                  <p className="text-foreground-700">
                    If you have questions about this Privacy Policy or your privacy rights, please contact our Privacy Officer at:
                  </p>
                  <div className="mt-2 text-foreground-700">
                    <p>Email: privacy@fusehealth.com</p>
                    <p>Phone: 1-800-PRIVACY</p>
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