import React, { useState } from 'react';
import AIExecutor from './AIExecutor';
import './AI.css';

function AI() {
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsExecuting(true);
    setError(null);
    setProgress([]);

    try {
      const executor = new AIExecutor('AIzaSyBSXRGDcMEfwZEGhO3QPUnAxFvWAVG9Ch0');
      
      // Check feasibility
      const feasibility = await executor.checkFeasibility(prompt);
      if (!feasibility.feasible) {
        throw new Error(`Task is not feasible: ${feasibility.message}`);
      }
      setProgress(prev => [...prev, { success: true, summary: "Feasibility check passed" }]);

      // Begin task
      const command = await executor.beginTask(prompt);
      setProgress(prev => [...prev, { success: true, summary: `Initial command: ${command}` }]);

      // Execute task
      const result = await executor.executeTask(prompt);
      setProgress(prev => [
        ...prev,
        ...result.taskSummary,
        { success: true, summary: result.finalSummary }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setProgress(prev => [...prev, { success: false, summary: "Task execution failed" }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-card">
        <div className="ai-card-header">
          <h2>AI Task Executor</h2>
          <p>Enter your task prompt and the AI will execute it step by step</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="ai-card-content">
            <div className="textarea-container">
              <textarea
                placeholder="Enter your task prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isExecuting}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <h4>Error</h4>
                <p>{error}</p>
              </div>
            )}

            {progress.length > 0 && (
              <div className="progress-container">
                <div className="progress-list">
                  {progress.map((step, index) => (
                    <div key={index} className={`progress-item ${step.success ? 'success' : 'error'}`}>
                      <span className="badge">
                        {step.success ? "Success" : "Failed"}
                      </span>
                      <span className="summary">{step.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="ai-card-footer">
            <button 
              type="submit" 
              className="submit-button"
              disabled={!prompt.trim() || isExecuting}
            >
              {isExecuting ? (
                <>
                  <span className="loading-spinner"></span>
                  Executing...
                </>
              ) : (
                <>
                  <span className="send-icon">➤</span>
                  Execute Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AI;

