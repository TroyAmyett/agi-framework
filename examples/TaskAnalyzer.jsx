/**
 * Task Analyzer - Example Application
 * 
 * Demonstrates how to use the AGI Framework to build a practical application.
 * This example takes a user's task description and uses the ReasoningAgent
 * to break it down and provide analysis.
 */

import React, { useState } from 'react';
import { ReasoningAgent } from '../framework/agents/ReasoningAgent';
import { AnthropicProvider } from '../framework/providers/AnthropicProvider';

function TaskAnalyzer() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Initialize provider and agent
  const getAgent = () => {
    const provider = new AnthropicProvider({
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY
    });

    return new ReasoningAgent({
      id: 'task-analyzer',
      provider: provider
    });
  };

  const analyzeTask = async () => {
    if (!task.trim()) {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const agent = getAgent();

      const taskResult = await agent.execute({
        id: `task-${Date.now()}`,
        description: task,
        priority: 'medium'
      });

      setResult(taskResult);
    } catch (err) {
      setError(err.message || 'Failed to analyze task');
      console.error('Task analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeTask();
    }
  };

  return (
    <div className="task-analyzer">
      <div className="analyzer-container">
        <h1>🤖 Task Analyzer</h1>
        <p className="subtitle">
          Powered by AGI Framework - Uses AI to break down and analyze complex tasks
        </p>

        <div className="input-section">
          <label htmlFor="task-input">
            Describe your task:
          </label>
          <textarea
            id="task-input"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="E.g., Plan a marketing campaign for a new SaaS product targeting developers"
            rows={4}
            disabled={loading}
          />
          <div className="input-footer">
            <span className="hint">Press Ctrl+Enter to analyze</span>
            <button
              onClick={analyzeTask}
              disabled={loading || !task.trim()}
              className="analyze-btn"
            >
              {loading ? '🔄 Analyzing...' : '✨ Analyze Task'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="results-section">
            <h2>📊 Analysis Results</h2>

            {/* Strategy Overview */}
            {result.plan?.strategy && (
              <div className="result-card">
                <h3>Strategy</h3>
                <p>{result.plan.strategy}</p>
              </div>
            )}

            {/* Subtasks */}
            {result.subtaskResults && result.subtaskResults.length > 0 && (
              <div className="result-card">
                <h3>Breakdown ({result.subtaskResults.length} steps)</h3>
                <div className="subtasks-list">
                  {result.subtaskResults.map((subtask, index) => (
                    <div key={index} className="subtask-item">
                      <div className="subtask-header">
                        <span className="subtask-number">{index + 1}</span>
                        <h4>{subtask.subtask}</h4>
                      </div>

                      {subtask.reasoning && (
                        <div className="subtask-reasoning">
                          <strong>Reasoning:</strong>
                          <p>{subtask.reasoning}</p>
                        </div>
                      )}

                      <div className="subtask-result">
                        <strong>Result:</strong>
                        <p>{subtask.result}</p>
                      </div>

                      {subtask.tokens && (
                        <div className="subtask-meta">
                          <span className="token-count">
                            Tokens used: {subtask.tokens.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Answer */}
            {result.finalAnswer && (
              <div className="result-card final-answer">
                <h3>📝 Synthesis</h3>
                <div className="final-answer-content">
                  {result.finalAnswer}
                </div>
              </div>
            )}

            {/* Quality Score (if reflection was used) */}
            {result.evaluationScore && (
              <div className="result-card quality-score">
                <h3>Quality Score</h3>
                <div className="score-display">
                  <span className="score-value">{result.evaluationScore}</span>
                  <span className="score-max">/10</span>
                </div>
                {result.improved && (
                  <p className="improved-badge">✨ Improved through reflection</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Example Tasks */}
        <div className="examples-section">
          <h3>💡 Example Tasks</h3>
          <div className="example-tasks">
            <button
              onClick={() => setTask('Plan a user onboarding flow for a mobile app')}
              className="example-btn"
            >
              Plan onboarding flow
            </button>
            <button
              onClick={() => setTask('Design a content marketing strategy for Q1')}
              className="example-btn"
            >
              Marketing strategy
            </button>
            <button
              onClick={() => setTask('Optimize database query performance for our analytics dashboard')}
              className="example-btn"
            >
              Optimize database
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .task-analyzer {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .analyzer-container {
          max-width: 900px;
          margin: 0 auto;
        }

        h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        .input-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .hint {
          color: #666;
          font-size: 0.875rem;
        }

        .analyze-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #c33;
          margin-bottom: 2rem;
        }

        .results-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .results-section > h2 {
          color: white;
          font-size: 1.75rem;
        }

        .result-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .result-card h3 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .subtasks-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .subtask-item {
          border-left: 3px solid #667eea;
          padding-left: 1.5rem;
        }

        .subtask-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .subtask-number {
          background: #667eea;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .subtask-header h4 {
          color: #333;
          margin: 0;
        }

        .subtask-reasoning,
        .subtask-result {
          margin-bottom: 0.75rem;
        }

        .subtask-reasoning strong,
        .subtask-result strong {
          display: block;
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .subtask-reasoning p,
        .subtask-result p {
          margin: 0;
          color: #333;
          line-height: 1.6;
        }

        .subtask-meta {
          color: #999;
          font-size: 0.875rem;
        }

        .final-answer {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .final-answer-content {
          color: #333;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .quality-score {
          text-align: center;
        }

        .score-display {
          font-size: 3rem;
          font-weight: 700;
          color: #667eea;
          margin: 1rem 0;
        }

        .score-max {
          font-size: 2rem;
          color: #999;
        }

        .improved-badge {
          background: #4caf50;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: inline-block;
          font-size: 0.875rem;
        }

        .examples-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .examples-section h3 {
          color: white;
          margin-bottom: 1rem;
        }

        .example-tasks {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .example-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .example-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

export default TaskAnalyzer;