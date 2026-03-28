import {
  DocHeading,
  DocText,
  DocList,
  DocCallout,
  DocCodeBlock,
  DocCodeWrap,
} from "@/components/DocsComponents";
import { FolderUp, HelpCircle } from "lucide-react";

export default function MaterialsDocsPage() {
  return (
    <>
      <div className="mb-4 text-indigo-400 font-mono text-sm tracking-wide">
        Core Features
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
        Upload & Manage Materials
      </h1>
      <DocText>
        Managing your academic documents has never been easier. StudyShare utilizes a sophisticated pipeline to analyze, categorize, and store your PDFs with minimal manual effort.
      </DocText>

      <DocCallout type="info" title="Important Note on Privacy">
        Documents uploaded by default are marked as Private. Only you have access to read them unless you switch the visibility setting.
      </DocCallout>

      <DocHeading id="uploading" level={2}>
        The Upload Process
      </DocHeading>
      <DocText>
        When you drop a file into the upload zone on your Dashboard, StudyShare triggers the following sequence:
      </DocText>

      <DocList ordered>
        <li>
          <strong>File Validation:</strong> We verify the file type (currently <DocCodeWrap>application/pdf</DocCodeWrap>) and size limit (default 50MB).
        </li>
        <li>
          <strong>Secure Storage:</strong> The raw PDF is securely transmitted to our Cloudinary vault equipped with signed URLs and strict access policies.
        </li>
        <li>
          <strong>Text & Metadata Extraction:</strong> The system reads standard text, and Anthropic's Claude model analyzes it to extract tags, course names, and subjects.
        </li>
      </DocList>

      <DocHeading id="managing" level={2}>
        Managing Your Content
      </DocHeading>
      <DocText>
        You can navigate to the <DocCodeWrap>My Materials</DocCodeWrap> tab to see all your active documents. From here you can:
      </DocText>
      <DocList>
        <li>Read documents using the integrated high-speed PDF rendering engine.</li>
        <li>Filter by University Subject (e.g. Physics 101, Data Structures).</li>
        <li>Update document visibility (Public vs. Private).</li>
        <li>Ask questions to the AI specific just to a single document.</li>
      </DocList>

      <DocHeading id="troubleshooting-uploads" level={2}>
        Troubleshooting
      </DocHeading>

      <div className="space-y-4 my-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 text-white font-medium mb-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            My PDF failed to upload
          </div>
          <DocText>
            Ensure your file is not password-protected. Ensure the size is below 50MB. If it continues to fail, try refreshing the dashboard connection.
          </DocText>
        </div>
      </div>
      
    </>
  );
}
