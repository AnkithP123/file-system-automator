import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

class AIExecutor {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("REACT_APP_GEMINI_API_KEY is required");
        }
        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are an assistant helping execute file system tasks based on user prompts. You execute tasks by running shell commands whenever you are asked for them. A shell command can be run by simply typing out the command with no other text when you are told. Follow each instruction accurately and provide feedback for each step. The user's operating system is ${navigator.userAgent}.`,
        });
        this.generationConfig = {
            temperature: 0.7,
            topP: 0.9,
            topK: 50,
            maxOutputTokens: 100,
            stopSequences: ["End of Response"],
            responseMimeType: "text/plain",
        };
        this.chatSession = this.model.startChat({
            generationConfig: this.generationConfig,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
            history: [],
        });
    }

    async sendMessage(message) {
        try {
            const result = await this.chatSession.sendMessage(message);
            return result.response.text().trim();
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
            throw new Error("Failed to communicate with Gemini.");
        }
    }

    async checkFeasibility(prompt) {
        const message = `Check the feasibility of this task: "${prompt}". Respond with 'feasible:true' or 'feasible:false' followed by a brief explanation.`;
        const response = await this.sendMessage(message);
        const feasibleMatch = response.match(/feasible:(true|false)/);
        if (feasibleMatch) {
            return {
                feasible: feasibleMatch[1] === "true",
                message: response.replace(/feasible:(true|false)/, "").trim(),
            };
        }
        throw new Error("Invalid feasibility response from Gemini.");
    }


    async beginTask(prompt) {
        const message = `Begin this task based on the prompt: "${prompt}". Provide the first command to execute. You can ONLY respond with the command and nothing else. If you are COMPLETELY unable to complete the task with only terminal commands, respond with exactly 'task:impossible' followed by a brief explanation.`;
        const response = await this.sendMessage(message);
        if (response.toLowerCase().includes("task:impossible")) {
            throw new Error(`Task deemed impossible: ${response.replace(/task:impossible/i, "").trim()}`);
        }
        return response;
    }

    async getStepSummary(commandOutput) {
        const message = `Provide a summary of what was accomplished by this output: "${commandOutput}". Respond with ONLY the following format and nothing else: First, the word 'Success' or 'Failure', then a semicolon, and finally a brief summary of the outcome in a couple words.`;
        const response = await this.sendMessage(message);
        const summaryMatch = response.match(/(Success|Failure);(.+)/);
        console.log('Match: ', summaryMatch);
        if (summaryMatch) {
            return {
                success: summaryMatch[1] === "Success",
                summary: summaryMatch[2].trim(),
            };
        }
        console.log('INVALID:', response);
        throw new Error("Invalid summary response from Gemini.");
    }

    async getNextCommand(previousOutput) {
        const message = `Based on the previous output: "${previousOutput}", provide the next command to execute. If the task is completed, respond with 'task:completed'. If you are COMPLETELY unable to complete the task with only terminal commands, respond with 'task:impossible' followed by a brief explanation.`;
        const response = await this.sendMessage(message);
        if (response.toLowerCase().includes("task:completed")) {
            return "Task completed";
        }
        if (response.toLowerCase().includes("task:impossible")) {
            throw new Error(`Task deemed impossible: ${response.replace(/task:impossible/i, "").trim()}`);
        }
        return response;
    }

    async finalizeTask() {
        const message = "Finalize the task and provide a summary of all steps taken.";
        const response = await this.sendMessage(message);
        return response;
    }

    async executeTask(prompt, onProgress) {
        const feasibility = await this.checkFeasibility(prompt);
        if (!feasibility.feasible) {
            throw new Error(`Task is not feasible: ${feasibility.message}`);
        }

        let command = await this.beginTask(prompt);
        let taskCompleted = false;
        let taskSummary = [];

        while (!taskCompleted) {
            await new Promise(r => setTimeout(r, 3000));
            const commandOutput = await this.executeCommand(command);

            const stepSummary = await this.getStepSummary(commandOutput);
            taskSummary.push(stepSummary);
            onProgress && onProgress(stepSummary); // Call the progress callback

            command = await this.getNextCommand(commandOutput);
            if (command.toLowerCase().includes("task completed")) {
                taskCompleted = true;
            }
        }

        const finalSummary = await this.finalizeTask();
        onProgress && onProgress({ success: true, summary: finalSummary }); // Final update
        return {
            taskSummary,
            finalSummary,
        };
    }

    // Mock implementation of executeCommand
    async executeCommand(command) {
        let result = await window.electron.executeShellCommand(command);
        console.log('OUTPUT2:', result);
        if (result.success) {
            return result.data.output;
        } else {
            return result.message;
        }
        
    }
}

export default AIExecutor;

