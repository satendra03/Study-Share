import {
  DocHeading,
  DocText,
  DocList,
  DocCallout,
  DocCodeWrap,
} from "@/components/DocsComponents";

export default function AIDocsPage() {
  return (
    <>
      <div className="mb-4 text-indigo-400 font-mono text-sm tracking-wide">
        Core Features
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
        AI Assistant
      </h1>
      <DocText>
        The AI Assistant in StudyShare goes beyond simple web searches. It acts as an intelligent companion tailored for your study workflow, helping you understand complex topics and summarize notes effectively.
      </DocText>

      <DocCallout type="success" title="Intelligent Companion">
        StudyShare utilizes advanced language models to provide context-aware responses. Instead of generic answers, our chatbot helps you understand and pinpoint terminology matching your curriculum.
      </DocCallout>

      <DocHeading id="best-practices" level={2}>
        Structuring Questions
      </DocHeading>
      <DocText>
        You will see the best results from the AI when providing specific instructions:
      </DocText>
      
      <DocList>
        <li>Avoid single word topics (<DocCodeWrap>Photosynthesis</DocCodeWrap>) and instead use phrases (<DocCodeWrap>Explain photosynthesis and list the 3 main cycles</DocCodeWrap>).</li>
        <li>Specify the context if needed. Ask: <DocCodeWrap>Summarize chapter 5 of my biology textbook.</DocCodeWrap></li>
        <li>Review citations automatically generated after an answer.</li>
      </DocList>

      <DocHeading id="accuracy" level={2}>
        Accuracy vs Hallucination
      </DocHeading>
      <DocText>
        Because the AI operates under rigorous instruction sets, if it cannot find the answer in any of your uploaded materials or the global repository, it will inform you, rather than attempting to guess and hallucinate incorrect facts. Always remember to independently verify.
      </DocText>

      <DocHeading id="limits" level={2}>
        Rate Limits & Tokens
      </DocHeading>
      <DocText>
        To prevent abuse, AI interactions are rate-limited per user. Our frontend handles these gracefully, queuing your messages during spikes.
      </DocText>
    </>
  );
}
