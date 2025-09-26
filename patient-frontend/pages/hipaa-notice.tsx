import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function HipaaNotice() {
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
                  <h1 className="text-2xl font-bold text-foreground">HIPAA Privacy Notice</h1>
                  <p className="text-foreground-600">Notice of Privacy Practices for Protected Health Information</p>
                  <p className="text-foreground-600">Effective Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Your Rights Regarding Your Health Information</h2>
                  <p className="text-foreground-700 mb-4">
                    You have the following rights regarding the protected health information (PHI) that we maintain about you:
                  </p>

                  <h3 className="text-lg font-medium mb-2">Right to Access</h3>
                  <p className="text-foreground-700 mb-4">
                    You have the right to inspect and copy your health information. This includes medical and billing records used to make decisions about your care.
                  </p>

                  <h3 className="text-lg font-medium mb-2">Right to Request Amendment</h3>
                  <p className="text-foreground-700 mb-4">
                    If you believe that information in your record is incorrect or incomplete, you may request that we amend the information.
                  </p>

                  <h3 className="text-lg font-medium mb-2">Right to Request Restrictions</h3>
                  <p className="text-foreground-700 mb-4">
                    You have the right to request restrictions on how we use or disclose your health information for treatment, payment, or healthcare operations.
                  </p>

                  <h3 className="text-lg font-medium mb-2">Right to Request Confidential Communications</h3>
                  <p className="text-foreground-700 mb-4">
                    You have the right to request that we communicate with you in a certain way or at a certain location to maintain your privacy.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">How We Use and Disclose Your Health Information</h2>

                  <h3 className="text-lg font-medium mb-2">Treatment</h3>
                  <p className="text-foreground-700 mb-4">
                    We use your health information to provide, coordinate, or manage your healthcare and related services.
                    This may include sharing information with other healthcare providers involved in your care.
                  </p>

                  <h3 className="text-lg font-medium mb-2">Payment</h3>
                  <p className="text-foreground-700 mb-4">
                    We use and disclose your health information to obtain payment for the healthcare services we provide to you.
                    This may include sharing information with your insurance company.
                  </p>

                  <h3 className="text-lg font-medium mb-2">Healthcare Operations</h3>
                  <p className="text-foreground-700 mb-4">
                    We use and disclose your health information for healthcare operations, which include quality assessment,
                    employee review, training programs, accreditation, certification, and compliance activities.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Other Uses and Disclosures</h2>
                  <p className="text-foreground-700 mb-4">We may use or disclose your health information without your authorization for:</p>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Public health activities</li>
                    <li>Health oversight activities</li>
                    <li>Judicial and administrative proceedings</li>
                    <li>Law enforcement purposes</li>
                    <li>To prevent a serious threat to health or safety</li>
                    <li>Military and veterans activities</li>
                    <li>Workers' compensation</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Your Authorization</h2>
                  <p className="text-foreground-700 mb-4">
                    Other than as described above, we will not use or disclose your health information without your written authorization.
                    If you give us authorization to use or disclose health information about you, you may revoke that authorization
                    in writing at any time.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Security Measures</h2>
                  <p className="text-foreground-700 mb-4">We protect your health information through:</p>
                  <ul className="list-disc list-inside text-foreground-700 space-y-2">
                    <li>Administrative safeguards (policies, training, access controls)</li>
                    <li>Physical safeguards (facility security, workstation use, device controls)</li>
                    <li>Technical safeguards (encryption, authentication, transmission security)</li>
                    <li>Regular security risk assessments and updates</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Breach Notification</h2>
                  <p className="text-foreground-700 mb-4">
                    In the unlikely event of a breach of your protected health information,
                    we will notify you in accordance with federal requirements within 60 days of discovering the breach.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Complaints</h2>
                  <p className="text-foreground-700 mb-4">
                    If you believe your privacy rights have been violated, you may file a complaint with us or with the
                    Department of Health and Human Services Office for Civil Rights. We will not retaliate against you
                    for filing a complaint.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
                  <p className="text-foreground-700 mb-4">
                    For questions about this notice or to exercise your rights, contact our Privacy Officer:
                  </p>
                  <div className="mt-2 text-foreground-700">
                    <p><strong>Privacy Officer</strong></p>
                    <p>Fuse Health</p>
                    <p>Email: privacy@fusehealth.com</p>
                    <p>Phone: 1-800-PRIVACY</p>
                    <p>Address: [Your Business Address]</p>
                  </div>

                  <p className="text-foreground-700 mt-4">
                    <strong>To file a complaint with HHS:</strong><br />
                    Office for Civil Rights<br />
                    U.S. Department of Health and Human Services<br />
                    200 Independence Avenue, S.W.<br />
                    Washington, D.C. 20201<br />
                    Phone: 1-877-696-6775<br />
                    Website: www.hhs.gov/ocr/privacy/
                  </p>
                </section>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}