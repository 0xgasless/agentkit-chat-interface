import 'server-only'; // Ensure this code only runs on server
import { Agentkit, AgentkitToolkit } from "@0xgasless/agentkit";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { StructuredTool } from '@langchain/core/tools';

// Server-side agent store
const agentInstances = new Map();

export async function getOrCreateAgent(privateKey: `0x${string}`) {
    // Check if we already have an instance
    if (agentInstances.has(privateKey)) {
        return agentInstances.get(privateKey);
    }

    // Create new agent instance
    const instance = await createAgentInstance(privateKey);
    agentInstances.set(privateKey, instance);
    return instance;
}

async function createAgentInstance(privateKey: `0x${string}`) {
    try {
        const llm = new ChatOpenAI({
            model: "openai/gpt-4o",
            openAIApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
            },
        });

        // Configure agent with wallet entirely server-side
        const agentkit = await Agentkit.configureWithWallet({
            privateKey,
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
            apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
            chainID: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 56,
        });

        const toolkit = new AgentkitToolkit(agentkit);
        const tools = toolkit.getTools();

        const memory = new MemorySaver();
        const config = { configurable: { thread_id: "0xGasless AgentKit Chat" } };

        const agent = createReactAgent({
            llm,
            tools: tools as StructuredTool[],
            checkpointSaver: memory,
            messageModifier: `You are a helpful agent that can interact with EVM chains using 0xGasless smart accounts. You can perform 
    gasless transactions using the account abstraction wallet. You can check balances of ETH and any ERC20 token 
    by providing their contract address. Be concise and helpful with your responses.`,
        });

        return { agent, config };
    } catch (error) {
        console.error("Failed to create agent instance:", error);
        
        // Return a minimal mock agent that won't try to use crypto
        return {
            agent: {
                stream: async () => {
                    // Simple generator that just returns a single message
                    return {
                        async *[Symbol.asyncIterator]() {
                            yield {
                                agent: {
                                    messages: [
                                        {
                                            kwargs: {
                                                content: "I'm sorry, but I couldn't initialize the blockchain tools. This could be due to network issues or configuration problems."
                                            }
                                        }
                                    ]
                                }
                            };
                        }
                    };
                }
            },
            config: { configurable: { thread_id: "fallback-agent" } }
        };
    }
} 
