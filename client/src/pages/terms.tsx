import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";

export default function TermsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/register" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-6">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-4">Last updated: January 2026</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By creating an account on NRIChristianMatrimony ("the Platform"), you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part 
            of these terms, you must not use our services.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. User Responsibilities</h2>
          <p className="text-muted-foreground mb-4">
            You are solely responsible for all content, information, photographs, and materials you upload, 
            post, or share on the Platform ("User Content"). This includes but is not limited to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
            <li>Profile information and biographical details</li>
            <li>Photographs and images</li>
            <li>Messages and communications</li>
            <li>Any other content you submit to the Platform</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Content Standards</h2>
          <p className="text-muted-foreground mb-4">
            You represent and warrant that all User Content you provide:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
            <li>Is accurate, truthful, and not misleading</li>
            <li>Does not infringe upon any third party's intellectual property rights, privacy rights, or other legal rights</li>
            <li>Does not contain any defamatory, obscene, offensive, or unlawful material</li>
            <li>Does not contain any viruses, malware, or harmful code</li>
            <li>Complies with all applicable local, state, national, and international laws</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Indemnification</h2>
          <p className="text-muted-foreground mb-4">
            You agree to indemnify, defend, and hold harmless NRIChristianMatrimony, its owners, operators, 
            officers, directors, employees, agents, and affiliates from and against any and all claims, damages, 
            losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
            <li>Your User Content</li>
            <li>Your use of the Platform</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Any claims by third parties related to your User Content</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NRICHRISTIANMATRIMONY SHALL NOT BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, 
            DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
            <li>Your access to or use of (or inability to access or use) the Platform</li>
            <li>Any conduct or content of any third party on the Platform</li>
            <li>Any User Content obtained from the Platform</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground mb-4">
            THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED. NRICHRISTIANMATRIMONY DOES NOT WARRANT THAT THE PLATFORM WILL BE 
            UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DO NOT VERIFY THE IDENTITY, BACKGROUND, OR STATEMENTS 
            OF USERS AND MAKE NO REPRESENTATIONS ABOUT THE ACCURACY OR RELIABILITY OF USER CONTENT.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. User Verification</h2>
          <p className="text-muted-foreground mb-4">
            While we may offer verification features, you acknowledge that NRIChristianMatrimony cannot 
            guarantee the identity, background, character, or intentions of any user. You agree to exercise 
            caution and good judgment when interacting with other users and meeting them in person.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            By uploading User Content, you grant NRIChristianMatrimony a non-exclusive, worldwide, royalty-free, 
            perpetual license to use, display, reproduce, and distribute your User Content in connection with 
            operating and promoting the Platform.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Account Termination</h2>
          <p className="text-muted-foreground mb-4">
            NRIChristianMatrimony reserves the right to suspend or terminate your account at any time, with or 
            without cause, and with or without notice. Upon termination, your right to use the Platform will 
            immediately cease.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to us. Your use of the Platform is also governed by our Privacy Policy, 
            which describes how we collect, use, and share your information.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">11. Dispute Resolution</h2>
          <p className="text-muted-foreground mb-4">
            Any disputes arising from these Terms or your use of the Platform shall be resolved through binding 
            arbitration in accordance with the rules of the American Arbitration Association. You agree to waive 
            your right to a jury trial and to participate in class action lawsuits.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">12. Governing Law</h2>
          <p className="text-muted-foreground mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, 
            United States, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
          <p className="text-muted-foreground mb-4">
            NRIChristianMatrimony reserves the right to modify these Terms at any time. We will notify users of 
            any material changes. Your continued use of the Platform after such modifications constitutes your 
            acceptance of the updated Terms.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">14. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms and Conditions, please contact us at:{" "}
            <a href="mailto:opsauto3@gmail.com" className="text-primary hover:underline">opsauto3@gmail.com</a>
          </p>

          <div className="mt-12 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              By creating an account, you confirm that you have read and agree to these Terms and Conditions 
              and acknowledge that you are solely responsible for all content you upload to NRIChristianMatrimony.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
