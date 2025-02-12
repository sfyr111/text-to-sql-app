'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface QueryResult {
  [key: string]: string | number | boolean | null;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);

  const generateAndExecute = async () => {
    if (!prompt) return;

    setLoading(true);
    try {
      // 生成 SQL
      const response = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate SQL');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let sqlQuery = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        sqlQuery += decoder.decode(value);
        setSql(sqlQuery);
      }

      // 执行 SQL
      const execResponse = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      });

      if (!execResponse.ok) throw new Error('Failed to execute SQL');

      const { results } = await execResponse.json();
      setResults(results);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Text to SQL Converter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Natural Language Query</h2>
            <Textarea
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              placeholder="e.g., Show me all users who made orders above $100"
              className="min-h-[200px]"
            />
          </Card>

          {sql && (
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-2">Generated SQL</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{sql}</code>
              </pre>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Query Results</h2>
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left bg-gray-100">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="border-t px-4 py-2">
                            {value?.toString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No results to display</p>
            )}
          </Card>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button
          onClick={generateAndExecute}
          disabled={loading || !prompt}
          className="w-48"
        >
          {loading ? 'Processing...' : 'Generate & Execute'}
        </Button>
      </div>
    </div>
  );
}
