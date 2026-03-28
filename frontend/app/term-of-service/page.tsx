import { LegalLayout } from "@/components/LegalLayout";

export default function TermsOfServicePage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="March 2026">
      <p>By accessing and using StudyShare ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. StudyShare reserves the right to modify these terms at any time. Your continued use of the Service constitutes acceptance of any changes.</p>

      <h2>1. Eligibility</h2>
      <p>You must be at least 13 years of age to use this Service. If you are under 18, you represent that you have obtained parental or guardian consent. By using StudyShare, you warrant that all information you provide is accurate and complete.</p>

      <h2>2. Account Registration</h2>
      <p>To access certain features, you must create an account with valid credentials. You are responsible for:</p>
      <ul>
        <li>Maintaining the confidentiality of your password</li>
        <li>Notifying us immediately of any unauthorized access</li>
        <li>All activities that occur under your account</li>
      </ul>

      <h2>3. Acceptable Use Policy</h2>
      <p>You agree not to use StudyShare for:</p>
      <ul>
        <li>Uploading or distributing copyrighted material without authorization</li>
        <li>Creating unauthorized commercial advantage from the Service</li>
        <li>Harassment, hate speech, or abusive content</li>
        <li>Attempting to gain unauthorized access or disrupt service</li>
        <li>Reverse engineering, decompiling, or unauthorized scraping</li>
        <li>Transmitting malware or malicious code</li>
      </ul>

      <h2>4. Intellectual Property Rights</h2>
      <p>StudyShare and its components, including but not limited to software, interfaces, content, and design, are owned by StudyShare or licensed from third parties. You retain ownership of materials you upload, but grant StudyShare a non-exclusive, worldwide, royalty-free license to use, store, and process your content to provide the Service.</p>

      <h2>5. User-Generated Content</h2>
      <p>You are solely responsible for the legality and appropriateness of materials you upload. By uploading content, you represent that you own or have authorization to share that content. StudyShare is not responsible for copyright infringement claims related to user-uploaded content. We may remove materials that violate intellectual property rights or these terms.</p>

      <h2>6. AI Chatbot Disclaimer</h2>
      <p>Our AI chatbot uses Anthropic Claude and Google Gemini to generate responses. While we strive for accuracy, AI responses are not guaranteed to be correct. Do not rely solely on chatbot responses for academic work. Always verify critical information with authoritative sources and your instructors.</p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>The Service is provided "AS IS" and "AS AVAILABLE." StudyShare disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure.</p>

      <h2>8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, StudyShare shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.</p>

      <h2>9. Data Processing</h2>
      <p>Your data will be processed for:</p>
      <ul>
        <li>OCR and text extraction from uploaded PDFs</li>
        <li>Generation of vector embeddings via Anthropic API</li>
        <li>Storage in Qdrant vector database</li>
        <li>Retrieval and context provision for AI chatbot responses</li>
      </ul>
      <p>We use encrypted storage and secure APIs. Your uploaded materials and chat history are retained as long as your account is active.</p>

      <h2>10. Indemnification</h2>
      <p>You agree to indemnify and hold harmless StudyShare from any claims, damages, or expenses (including attorney's fees) arising from your violation of these terms, your use of the Service, or your uploaded content.</p>

      <h2>11. Suspension and Termination</h2>
      <p>StudyShare reserves the right to suspend or terminate your account without notice if you violate these terms or engage in unlawful activity. Upon termination, your right to access the Service ceases immediately.</p>

      <h2>12. Governing Law</h2>
      <p>These Terms of Service are governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts in Delaware.</p>

      <h2>13. Dispute Resolution</h2>
      <p>Before initiating legal proceedings, you agree to attempt resolving disputes through good-faith negotiation with StudyShare. If negotiation fails, disputes shall be resolved through binding arbitration as per the rules of the American Arbitration Association (AAA).</p>

      <h2>14. Severability</h2>
      <p>If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</p>

      <h2>15. Contact Us</h2>
      <p>For questions about these Terms of Service:</p>
      <p>
        <strong>StudyShare Legal Team</strong><br/>
        Email: legal@studyshare.com<br/>
        Website: www.studyshare.com
      </p>
    </LegalLayout>
  );
}
