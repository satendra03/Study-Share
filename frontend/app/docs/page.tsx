import {
  DocHeading,
  DocText,
  DocList,
  DocCallout,
  DocCard,
  DocCardGrid,
  DocCodeBlock,
  DocCodeWrap,
} from "@/components/DocsComponents";
import { FolderUp, Bot, Sparkles, BookOpen } from "lucide-react";

export default function DocsIndexPage() {
  return (
    <>
      <div className="mb-4 text-indigo-400 font-mono text-sm tracking-wide">
        v1.0.0
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
        Introduction
      </h1>
      <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
        Welcome to the StudyShare documentation. This comprehensive guide will help you understand every aspect of the platform.
      </p>

      <DocCallout type="info" title="What is StudyShare?">
        StudyShare is a smart, modern platform designed for students. It seamlessly blends powerful document management with AI assistance, making discovering and understanding study materials simple, secure, and intuitive.
      </DocCallout>

      <DocHeading id="quick-start" level={2}>
        Quick Start
      </DocHeading>
      <DocText>
        Ready to dive right in? Use our interactive dashboard features to start boosting your productivity. StudyShare is designed out of the box to instantly organize and process your PDFs.
      </DocText>

      <DocList ordered>
        <li>
          <strong>Create an account:</strong> Sign up quickly securely using Google Authentication.
        </li>
        <li>
          <strong>Setup your profile:</strong> Selecting your University and Branch allows us to recommend tailored content just for you.
        </li>
        <li>
          <strong>Upload a Document:</strong> Provide any standard PDF document (slides, textbooks, exams) and let the engine do the heavy lifting of OCR & structuring.
        </li>
      </DocList>

      <DocHeading id="core-features" level={2}>
        Core Workflows
      </DocHeading>
      <DocText>
        Explore the primary capabilities of StudyShare.
      </DocText>

      <DocCardGrid>
        <DocCard
          href="/docs/materials"
          title="Upload & Organize Materials"
          description="Drag-and-drop workflow with robust metadata extraction, sorting everything correctly."
          icon={FolderUp}
        />
        <DocCard
          href="/docs/ai"
          title="AI Assistant"
          description="A fully integrated conversational chatbot utilizing advanced AI models to answer your study questions."
          icon={Bot}
        />
        <DocCard
          href="#ocr-integration"
          title="Automated OCR Extraction"
          description="Powered by Anthropic Claude for converting raw images/pdfs into structured JSON data."
          icon={Sparkles}
        />
        <DocCard
          href="/docs/api"
          title="Developer APIs for Integrations"
          description="Leverage the backend REST API directly in your own applications."
          icon={BookOpen}
        />
      </DocCardGrid>

      <DocHeading id="prerequisites" level={2}>
        Prerequisites
      </DocHeading>
      <DocText>
        Before you begin configuring the developer tools, ensure that your system has the following requirements. If you are just using the web app, you won't need these:
      </DocText>

      <DocCodeBlock language="json" code={`{
  "node": ">= 20.x",
  "npm": ">= 10.x"
}`} />

      <DocHeading id="need-help" level={2}>
        Having Trouble?
      </DocHeading>
      <DocText>
        If these documentation pages do not answer your question, or if you encounter a bug, please create a ticket detailing the issue or look at our platform status.
      </DocText>
    </>
  );
}
