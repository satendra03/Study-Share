import {
  DocHeading,
  DocText,
  DocCodeBlock,
  DocCallout,
  DocCodeWrap,
} from "@/components/DocsComponents";

export default function APIDocsPage() {
  return (
    <>
      <div className="mb-4 text-indigo-400 font-mono text-sm tracking-wide">
        Developer Options
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
        API Reference
      </h1>
      <DocText>
        We expose essential parts of our backend to enable programmatic integrations. Currently, access is strictly limited to early access partners inside the University beta program.
      </DocText>

      <DocCallout type="warning" title="Beta Notice">
        The v1 API parameters and rate limits are subject to change. Production applications should depend on official release announcements before scaling.
      </DocCallout>

      <DocHeading id="auth" level={2}>
        Authentication
      </DocHeading>
      <DocText>
        Pass a Firebase valid Bearer token as your authorization header when sending a request.
      </DocText>
      <DocCodeBlock language="bash" code={`curl -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \\
  https://api.studyshare.com/v1/materials`} />

      <DocHeading id="endpoints" level={2}>
        Available Endpoints
      </DocHeading>

      <div className="mt-8 space-y-8">
        {/* Endpoint 1 */}
        <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
          <div className="bg-[#0b0f19] px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">GET</span>
              <span className="text-gray-200 font-mono text-sm">/v1/materials</span>
            </div>
          </div>
          <div className="p-5">
            <DocText>Retrieves a paginated list of all accessible materials for the current user session.</DocText>
            <DocCodeBlock language="json" code={`{
  "success": true,
  "data": [
    {
      "id": "mat_123",
      "title": "Quantum Physics Notes",
      "type": "application/pdf"
    }
  ],
  "meta": {
    "total": 14,
    "page": 1
  }
}`} />
          </div>
        </div>

        {/* Endpoint 2 */}
        <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
          <div className="bg-[#0b0f19] px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">POST</span>
              <span className="text-gray-200 font-mono text-sm">/v1/chat</span>
            </div>
          </div>
          <div className="p-5">
            <DocText>Initiates a conversation turn with the AI assistant. Provide optional context scopes.</DocText>
            <DocCodeBlock language="json" code={`{
  "message": "What did Professor Smith say about gravity?",
  "documents": ["mat_123", "mat_456"]
}`} />
          </div>
        </div>
      </div>
    </>
  );
}
