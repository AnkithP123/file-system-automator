import React, { useState } from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import AIExecutor from './AIExecutor';

const AI = () => {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(false);

    const executeTask = async () => {
        setLoading(true);
        const aiExecutor = new AIExecutor();

        try {
            // Step 1: Ask Gemini the feasibility of the prompt
            const feasibilityResponse = await aiExecutor.sendMessage('Check feasibility of the prompt');
            if (feasibilityResponse.status !== 'Success') {
                setProgress(prev => [...prev, { status: 'Fail', description: 'Feasibility check failed' }]);
                setLoading(false);
                return;
            }
            setProgress(prev => [...prev, { status: 'Success', description: 'Feasibility check passed' }]);

            // Step 2: Tell Gemini to begin its task and run the very first command
            const firstCommandResponse = await aiExecutor.sendMessage('Begin task and run the first command');
            if (firstCommandResponse.status !== 'Success') {
                setProgress(prev => [...prev, { status: 'Fail', description: 'First command execution failed' }]);
                setLoading(false);
                return;
            }
            setProgress(prev => [...prev, { status: 'Success', description: 'First command executed successfully' }]);

            // Step 3: Get a summary of what was accomplished
            const summaryResponse = await aiExecutor.sendMessage('Get summary of the first command');
            if (summaryResponse.status !== 'Success') {
                setProgress(prev => [...prev, { status: 'Fail', description: 'Failed to get summary of the first command' }]);
                setLoading(false);
                return;
            }
            setProgress(prev => [...prev, { status: 'Success', description: 'Summary of the first command retrieved' }]);

            // Append the summary to the working list of progress
            setProgress(prev => [...prev, { status: 'Success', description: summaryResponse.summary }]);

        } catch (error) {
            setProgress(prev => [...prev, { status: 'Fail', description: 'An error occurred during execution' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>AI Task Executor</h1>
            <button onClick={executeTask} disabled={loading}>
                {loading ? 'Executing...' : 'Start Task'}
            </button>
            <ul>
                {progress.map((step, index) => (
                    <li key={index}>
                        {step.status === 'Success' ? (
                            <AiOutlineCheckCircle color="green" />
                        ) : (
                            <AiOutlineCloseCircle color="red" />
                        )}
                        {step.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AI;