'use client';

import { useState } from 'react';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
];

export default function CodePage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const handleRun = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          input: input || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOutput(data.result.output || '');
        if (data.result.error) {
          setError(data.result.error);
        }
      } else {
        setError(data.message || 'Execution failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Code Execution</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Write your ${language} code here...`}
              className="w-full h-64 p-2 border rounded font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Input (optional)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Provide input for your program..."
              className="w-full h-24 p-2 border rounded font-mono text-sm"
            />
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Output</label>
            <div className="w-full h-64 p-2 border rounded bg-gray-50 font-mono text-sm overflow-auto">
              {output || 'Output will appear here...'}
            </div>
          </div>

          {error && (
            <div>
              <label className="block text-sm font-medium mb-2 text-red-600">Error</label>
              <div className="w-full p-2 border rounded bg-red-50 text-red-700 font-mono text-sm overflow-auto">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">Python Hello World</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
{`print("Hello, World!")`}
            </pre>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">JavaScript Sum</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
{`const a = 5;
const b = 10;
console.log(a + b);`}
            </pre>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">Java Hello</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
{`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}