import React, { useState, useRef, useEffect } from 'react';
import { ReconciliationResult } from '../types';
import { answerQuestion } from '../utils/reconciliationEngine';
import { MessageSquare, Search, Send, Brain } from 'lucide-react';

interface NaturalLanguageAssistantProps {
  results: ReconciliationResult[];
}

const NaturalLanguageAssistant: React.FC<NaturalLanguageAssistantProps> = ({ results }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setThinking(true);
    
    // Simulate AI "thinking" with a typing effect
    const processingTime = 1000 + Math.random() * 1500; // Random processing time for realism
    
    setTimeout(() => {
      setThinking(false);
      
      // After "thinking", simulate a slight delay for the AI processing
      setTimeout(() => {
        const response = answerQuestion(query, results);
        setAnswer(response);
        setHistory(prev => [...prev, { question: query, answer: response }]);
        setQuery('');
        setLoading(false);
      }, 500);
    }, processingTime);
  };

  const exampleQueries = [
    "Show all unreconciled payments",
    "Why is invoice #1003 not fully reconciled?",
    "Why is Gamma LLC's payment not reconciled?",
    "Are there any duplicate payments?"
  ];

  const handleExampleClick = (question: string) => {
    setQuery(question);
    // Auto-submit after a short delay to simulate clicking
    setTimeout(() => {
      setLoading(true);
      setThinking(true);
      
      // Simulate thinking and processing for example queries too
      setTimeout(() => {
        setThinking(false);
        setTimeout(() => {
          const response = answerQuestion(question, results);
          setAnswer(response);
          setHistory(prev => [...prev, { question, answer: response }]);
          setQuery('');
          setLoading(false);
        }, 500);
      }, 1000);
    }, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Financial Assistant</h3>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Ask about reconciliation results, invoices, or payments
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6 max-h-[400px] overflow-y-auto">
        {history.length === 0 && !answer && (
          <div className="mb-5">
            <p className="text-sm text-gray-600 mb-2">Try asking questions like:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(q)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {history.length > 0 && (
          <div className="mb-6 space-y-4">
            {history.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex">
                  <div className="bg-indigo-100 rounded-lg px-4 py-2 max-w-[80%] text-gray-800">
                    <p className="text-sm">{item.question}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%] text-gray-800">
                    <p className="text-sm whitespace-pre-line">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {thinking && (
              <div className="flex justify-end">
                <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800 flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Ask a question about reconciliation results..."
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className={`inline-flex items-center border border-transparent rounded-md px-2 text-indigo-600 hover:text-indigo-700 ${
                    loading || !query.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NaturalLanguageAssistant;