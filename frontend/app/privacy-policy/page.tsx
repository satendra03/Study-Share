import { LegalLayout } from "@/components/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="March 2026">
      <p>
        StudyShare ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform, website, and related services (collectively, the "Service").
      </p>

      <h2>1. Information We Collect</h2>
      
      <h3>1.1 Account Information</h3>
      <ul>
        <li>Email address and password</li>
        <li>Full name and academic institution</li>
        <li>Subject of study, academic branch, and semester</li>
        <li>Profile picture (optional)</li>
      </ul>

      <h3>1.2 Educational Content</h3>
      <ul>
        <li>PDF documents and study materials you upload</li>
        <li>Structured metadata extracted from PDFs (subjects, exam years, question sections)</li>
        <li>Your interactions with materials (searches, chat history)</li>
      </ul>

      <h3>1.3 AI Chatbot Data</h3>
      <ul>
        <li>Chat messages and conversation history</li>
        <li>Context and references to study materials</li>
      </ul>

      <h3>1.4 Technical Data</h3>
      <ul>
        <li>IP address, browser type, and device information</li>
        <li>Cookies and similar tracking technologies</li>
        <li>Page access logs and service usage analytics</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve the Service</li>
        <li>To authenticate your identity and manage your account</li>
        <li>To process PDF uploads and extract learning materials</li>
        <li>To generate embeddings and power semantic search functionality</li>
        <li>To deliver AI-powered chatbot responses using Claude and Gemini APIs</li>
        <li>To send administrative communications and service updates</li>
        <li>To monitor and analyze usage for service improvements</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>3. Third-Party Services</h2>
      <p>We use the following third-party services that may access your data:</p>
      <ul>
        <li><strong>Firebase Authentication:</strong> For secure user authentication</li>
        <li><strong>Cloudinary:</strong> For storing and serving uploaded PDF files</li>
        <li><strong>Anthropic Claude API:</strong> For generating text embeddings and structuring OCR data</li>
        <li><strong>Google Gemini API:</strong> For powering AI chatbot responses</li>
        <li><strong>Qdrant Vector Database:</strong> For storing vector embeddings of study materials</li>
        <li><strong>MongoDB:</strong> For storing metadata and user account information</li>
        <li><strong>Redis/BullMQ:</strong> For asynchronous job processing</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures to protect your information, including:</p>
      <ul>
        <li>SSL/TLS encryption for data transmission</li>
        <li>Firebase authentication and security rules</li>
        <li>Secure password hashing and storage</li>
        <li>Regular security audits and updates</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We retain your data for the duration of your account and for as long as necessary to provide the Service. You may request deletion of your account and associated data by contacting us at privacy@studyshare.com.
      </p>

      <h2>6. User Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your account and data</li>
        <li>Withdraw consent for data processing</li>
        <li>Opt out of non-essential communications</li>
      </ul>

      <h2>7. Children's Privacy</h2>
      <p>
        Our Service is intended for users 13 years and older. We do not knowingly collect personal information from children under 13. If we discover we have collected information from a child under 13 without parental consent, we will take immediate steps to delete such information.
      </p>

      <h2>8. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on our website and updating the "Last Updated" date. Your continued use of the Service constitutes acceptance of the updated Privacy Policy.
      </p>

      <h2>9. Contact Us</h2>
      <p>If you have questions about this Privacy Policy or our privacy practices, please contact:</p>
      <p>
        <strong>StudyShare Privacy Team</strong><br/>
        Email: privacy@studyshare.com<br/>
        Website: www.studyshare.com
      </p>
    </LegalLayout>
  );
}
