const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

class AIExecutor {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are an assistant helping execute file system tasks based on user prompts. Follow each instruction accurately and provide feedback for each step.",
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
        const message = `Begin this task based on the prompt: "${prompt}". Provide the first command to execute.`;
        const response = await this.sendMessage(message);
        return response;
    }

    async getStepSummary(commandOutput) {
        const message = `Provide a summary of what was accomplished by this output: "${commandOutput}". Respond with ONLY the following format and nothing else: First, the word 'Success' or 'Failure', then a semicolon, and finally a brief summary of the outcome in a couple words.`;
        const response = await this.sendMessage(message);
        const summaryMatch = response.match(/(Success|Failure):(.+)/);
        if (summaryMatch) {
            return {
                success: summaryMatch[1] === "Success",
                summary: summaryMatch[2].trim(),
            };
        }
        throw new Error("Invalid summary response from Gemini.");
    }

    async getNextCommand(previousOutput) {
        const message = `Based on the previous output: "${previousOutput}", provide the next command to execute.`;
        const response = await this.sendMessage(message);
        return response;
    }

    async finalizeTask() {
        const message = "Finalize the task and provide a summary of all steps taken.";
        const response = await this.sendMessage(message);
        return response;
    }

    async executeTask(prompt) {
        const feasibility = await this.checkFeasibility(prompt);
        if (!feasibility.feasible) {
            throw new Error(`Task is not feasible: ${feasibility.message}`);
        }

        let command = await this.beginTask(prompt);
        let taskCompleted = false;
        let taskSummary = [];

        while (!taskCompleted) {
            // Execute the command (this part is abstracted, assuming a function executeCommand exists)
            const commandOutput = await executeCommand(command);

            const stepSummary = await this.getStepSummary(commandOutput);
            taskSummary.push(stepSummary);

            if (stepSummary.success) {
                command = await this.getNextCommand(commandOutput);
                if (command.toLowerCase().includes("task completed")) {
                    taskCompleted = true;
                }
            } else {
                throw new Error(`Command execution failed: ${stepSummary.summary}`);
            }
        }

        const finalSummary = await this.finalizeTask();
        return {
            taskSummary,
            finalSummary,
        };
    }
}

module.exports = AIExecutor;
