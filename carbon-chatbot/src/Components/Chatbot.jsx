import React from 'react';
import { useState, useRef, useEffect } from 'react';

const CarbonChatbot = () => {
  const [messages, setMessages] = useState([
    { 
      text: "🌱 Hello! I'm your Carbon Emissions Assistant. I can help you with:\n\n• Carbon footprint reduction strategies\n• Green cloud deployment best practices\n• Sustainable computing recommendations\n• Renewable energy insights\n• Environmental impact assessments\n• Data center efficiency tips\n\nAsk me anything about reducing carbon emissions and sustainable technology!", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Environment variable for Gemini API
  const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced semantic analysis for carbon-related queries
  const isCarbonRelated = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Direct carbon/sustainability keywords
    const carbonKeywords = [
      'carbon', 'emission', 'co2', 'greenhouse', 'sustainability', 'renewable',
      'green', 'energy', 'electricity', 'cloud', 'deploy', 'aws', 'azure',
      'gcp', 'datacenter', 'footprint', 'environment', 'climate', 'solar',
      'wind', 'hydro', 'nuclear', 'fossil', 'clean', 'eco', 'sustainable',
      'reduce', 'offset', 'neutral', 'intensity', 'kwh', 'power', 'grid',
      'computing', 'server', 'data center', 'efficiency', 'optimization'
    ];
    
    // Contextual phrases that indicate carbon/sustainability topics
    const contextualPhrases = [
      'producing.*carbon', 'highest.*emission', 'worst.*pollut', 'dirtiest.*energy',
      'cleanest.*region', 'greenest.*countr', 'most.*renewable', 'least.*renewable',
      'coal.*power', 'natural.*gas', 'fossil.*fuel', 'renewable.*source',
      'wind.*farm', 'solar.*panel', 'nuclear.*plant', 'hydroelectric',
      'regions.*producing', 'countries.*emission', 'states.*carbon',
      'best.*region.*deploy', 'worst.*region.*deploy', 'low.*carbon.*region',
      'high.*carbon.*region', 'sustainable.*deploy', 'green.*deploy'
    ];
    
    // Check for direct keywords
    const hasKeywords = carbonKeywords.some(keyword => lowerQuery.includes(keyword));
    
    // Check for contextual phrases using regex
    const hasContextualMatch = contextualPhrases.some(phrase => {
      const regex = new RegExp(phrase, 'i');
      return regex.test(lowerQuery);
    });
    
    return hasKeywords || hasContextualMatch;
  };

  // Enhanced fetch with timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Enhanced prompt template for Gemini - focused and concise
  const createCarbonPrompt = (userQuery) => {
    return `You are a Carbon Emissions and Sustainability Assistant. Provide direct, concise answers to carbon/sustainability questions.

RESPONSE RULES:
1. Answer ONLY what is asked - stay focused on the specific question
2. Be concise and direct (1-2 paragraphs maximum)
3. Use specific data, numbers, or examples when available
4. No unnecessary background information or lengthy explanations
5. If asked about regions/countries, list them with brief context
6. For "how-to" questions, provide clear, actionable steps
7. For comparative questions, give direct comparisons
8. End with: "For real-time data: https://app.electricitymaps.com/map" (only if relevant to the question)

EXAMPLE RESPONSE STYLES:
- "Top carbon regions" → List regions with carbon intensity values
- "How to reduce emissions" → Numbered steps or bullet points
- "Best green regions" → List regions with renewable % or carbon intensity
- "What is X" → Direct definition with key facts

USER QUESTION: ${userQuery}

Provide a focused, direct answer without extra information.`;
  };

  // Query Gemini AI with enhanced prompt
  const queryGemini = async (prompt) => {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: createCarbonPrompt(prompt)
              }]
            }],
            generationConfig: {
              temperature: 0.2,
              topK: 20,
              topP: 0.7,
              maxOutputTokens: 800
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from AI service');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini error:', error);
      
      if (error.message.includes('API_KEY')) {
        return "⚠️ API configuration issue. Please check your Gemini API key setup.";
      }
      
      return "⚠️ I'm having trouble connecting to my AI service right now. Please try again in a moment. For live carbon intensity data, you can visit: https://app.electricitymaps.com/map";
    }
  };

  // Enhanced message rendering with better formatting for lists and data
  const renderMessage = (text) => {
    return text.split('\n').map((line, i) => {
      // Handle URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (line.match(urlRegex)) {
        return (
          <p key={i} className="mb-2">
            {line.split(urlRegex).map((part, j) => {
              if (part.match(urlRegex)) {
                return (
                  <a
                    key={j}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-green-200 underline font-medium break-all"
                  >
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </p>
        );
      }

      // Handle numbered lists (1. 2. 3.)
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <p key={i} className="mb-1 ml-4">
            <span className="text-green-400 font-medium">{line.match(/^\d+\./)[0]}</span>
            <span className="ml-2">{line.replace(/^\d+\.\s/, '')}</span>
          </p>
        );
      }

      // Handle bullet points (• or -)
      if (/^[•\-]\s/.test(line.trim())) {
        return (
          <p key={i} className="mb-1 ml-4">
            <span className="text-green-400 font-medium">•</span>
            <span className="ml-2">{line.replace(/^[•\-]\s/, '')}</span>
          </p>
        );
      }

      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={i} className="mb-2">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-semibold text-green-300">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }

      return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
    });
  };

  const handleSend = async () => {
    const userInput = input.trim();
    if (!userInput || isLoading) return;
    
    // Enhanced context checking - be more permissive for sustainability topics
    if (!isCarbonRelated(userInput)) {
      // Check if it might be indirectly related to environmental topics
      const environmentalContext = /\b(region|country|state|area|location|deploy|infrastructure|technology|industry|pollution|power|fuel)\b/i.test(userInput);
      
      if (!environmentalContext) {
        setMessages(prev => [...prev, 
          { text: userInput, sender: 'user', timestamp: new Date() },
          { 
            text: "🌱 I specialize in carbon emissions and sustainability topics. Please ask me about:\n\n• Regional carbon emissions and clean energy\n• Green cloud deployment strategies\n• Sustainable data center practices\n• Renewable energy recommendations\n• Environmental impact of technology\n• Energy-efficient development practices\n\nHow can I help you with sustainability and carbon emissions?", 
            sender: 'bot', 
            timestamp: new Date() 
          }
        ]);
        setInput('');
        return;
      }
    }
    
    setMessages(prev => [...prev, { text: userInput, sender: 'user', timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await queryGemini(userInput);
      setMessages(prev => [...prev, { text: response, sender: 'bot', timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "⚠️ I encountered an error processing your request. Please try again. For live carbon data, visit: https://app.electricitymaps.com/map", 
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { text: "Top polluting regions", query: "Which regions have highest carbon emissions?" },
    { text: "Cleanest countries", query: "Which countries have lowest carbon footprint?" },
    { text: "Best AWS regions", query: "Which AWS regions are greenest for deployment?" },
    { text: "Reduce server emissions", query: "How to reduce data center carbon emissions?" },
    { text: "Green coding tips", query: "Energy efficient programming practices?" }
  ];

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-gray-100 shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🌱</span>
              Carbon Emissions Assistant
            </h1>
            <p className="text-emerald-100 mt-1">Direct answers to your sustainability questions</p>
          </div>
          <div className="text-right">
            <a 
              href="https://app.electricitymaps.com/map" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white font-medium"
            >
              📊 Live Carbon Map
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action.query)}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-full text-sm transition-colors duration-200"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white ml-auto' 
                : 'bg-gray-700 text-gray-100 border border-gray-600'
            }`}>
              <div className="prose prose-invert max-w-none">
                {renderMessage(msg.text)}
              </div>
              <div className={`text-xs mt-2 opacity-70 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-4 rounded-2xl shadow-lg border border-gray-600">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200"></div>
                </div>
                <span className="text-gray-300 text-sm">Thinking about sustainability...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full p-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400"
              placeholder="Ask direct questions about carbon emissions, regions, or green computing..."
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
              isLoading || !input.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
            }`}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 text-center">
          💡 Specialized in carbon emissions & sustainability • Powered by Gemini AI
        </div>
      </div>
    </div>
  );
};

export default CarbonChatbot;