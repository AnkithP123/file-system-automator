import React, { useState, useEffect } from 'react';
import AIExecutor from './AIExecutor';
import './AI.css';

function AI() {
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const [index, setIndex] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchNotificationsSetting = async () => {
      const enabled = await window.electron.getNotificationsEnabled();
      setNotificationsEnabled(enabled);
    };

    fetchNotificationsSetting();
  }, []);

  const getNextKey = () => {
    setIndex(index + 1);
    console.log(index);
    const keys = [
      atob("QUl6YVN5QlNYUkdEY01FZndaRUdoTzNRUFVuQXhGdldBVkc5Q2gw"),
      atob("QUl6YVN5REc2MjE3MS05NzVpWVlGWUtLb3EwMU1XS0RFS0NmOTdZ"),
      atob("QUl6YVN5RHhaWjdzU1d1VmdJaXFkajhKMUEwTXNTYWRpOEVMWWZZ"),
      atob("QUl6YVN5RFJ6SEtJSW9FQUFYSENPaXdqSlBCWWJhRmEwUTYxMzJz"),
      atob("QUl6YVN5RGZOVnNKallZSjNsNFZQT2c3YmFCMkVPQkRuZjhnQTR3"),
      atob("QUl6YVN5Q3lnZUxMWndvQ29wWkZYR05zXzZKZk1qZkZyNVRabHBN"),
      atob("QUl6YVN5QzJ1YzcwLWVNM2JNVkNZSVdpNjVvM1hTbm1xaUh0eUY0"),
      atob("QUl6YVN5QTNXYWVhSUhqVXpCcGJvcmRHMEppd1BpWFJDdTkzNTFz")
    ];

    if (index >= keys.length - 1) {
      setIndex(0);
    }

    return keys[index];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsExecuting(true);
    setError(null);
    setProgress([]);

    try {
      const executor = new AIExecutor(getNextKey());

      // Check feasibility
      const feasibility = await executor.checkFeasibility(prompt);
      if (!feasibility.feasible) {
        throw new Error(`Task is not feasible: ${feasibility.message}`);
      }
      setProgress(prev => [...prev, { success: true, summary: "Feasibility check passed" }]);

      // Begin task
      const command = await executor.beginTask(prompt);
      setProgress(prev => [...prev, { success: true, summary: `Initial command: ${command}` }]);

      // Execute task with progress callback
      const result = await executor.executeTask(prompt, (stepSummary) => {
        if (notificationsEnabled) {
          setProgress(prev => [...prev, stepSummary]);
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setProgress(prev => [...prev, { success: false, summary: "Task execution failed" }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="ai-wrapper">
      <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'right' }} >
        <div className="toggle-container">
          <label>
            <input
              type="checkbox"
              className='toggle'
              checked={notificationsEnabled}
              onChange={(e) => {
                setNotificationsEnabled(e.target.checked)
                window.electron.setNotificationsEnabled(e.target.checked);
              }}
            />
            Enable File Flicking Notifications
          </label>
        </div>
      </div>
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
    </div>
  );
}

export default AI;
