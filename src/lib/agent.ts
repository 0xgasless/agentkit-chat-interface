import { Agentkit, AgentkitToolkit } from "@0xgasless/agentkit";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { StructuredTool } from '@langchain/core/tools';

export async function initializeAgent(privateKey: `0x${string}`) {
    try {
        const llm = new ChatOpenAI({
            model: "openai/gpt-4o",
            openAIApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
            },
        });

        // Try a different approach to initialize the agent
        // Wrap in try/catch to handle any errors
        let agentkit: Agentkit | { getTools: () => never[] };
        try {
            agentkit = await Agentkit.configureWithWallet({
                privateKey,
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
                apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
                chainID: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453,
            });
        } catch (error) {
            console.error("Error configuring agentkit:", error);
            // Create a simplified agentkit implementation
            agentkit = {
                // Add minimal required methods here
                getTools: () => []
            };
        }

        // Use the agentkit (real or mock) to create tools
        const agentkitToolkit = new AgentkitToolkit(agentkit as Agentkit);
        const tools = agentkitToolkit.getTools();

        const memory = new MemorySaver();
        const agentConfig = { configurable: { thread_id: "0xGasless AgentKit Chatbot Example!" } };

        const agent = createReactAgent({        
            llm,
            tools: tools as StructuredTool[],
            checkpointSaver: memory,
            messageModifier: `You are a helpful agent that can interact with EVM chains using 0xGasless smart accounts. You can perform 
            gasless transactions using the account abstraction wallet. You can check balances of ETH and any ERC20 token 
            by providing their contract address. If someone asks you to do something you can't do with your currently 
            available tools, you must say so. Be concise and helpful with your responses.`,
        });

        return {
            agent,
            config: agentConfig
        };
    } catch (error) {
        console.error('Error initializing agent:', error);
        throw error;
    }
} 
