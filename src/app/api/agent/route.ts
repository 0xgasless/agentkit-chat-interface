import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const agentInstances = new Map();

async function getAgentInitializer() {
    const { initializeAgent } = await import('../../../lib/agent');
    return initializeAgent;
}

async function getHumanMessageClass() {
    const { HumanMessage } = await import('@langchain/core/messages');
    return HumanMessage;
}

export async function POST(request: NextRequest) {
    try {
        const isChat = request.headers.get('x-action') === 'chat';

        if (isChat) {
            const body = await request.json();
            const { messages, privateKey } = body;

            if (!privateKey) {
                return NextResponse.json({
                    success: false,
                    error: 'Private key is required for chat'
                }, { status: 400 });
            }

            const instance = agentInstances.get(privateKey);
            if (!instance) {
                return NextResponse.json({
                    success: false,
                    error: 'Agent not initialized. Please initialize first.'
                }, { status: 400 });
            }

            const HumanMessage = await getHumanMessageClass();

            const transformedMessages = messages.map((msg: { content: string }) => {
                return new HumanMessage(msg.content);
            });

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        const agentStream = await instance.agent.stream(
                            { messages: transformedMessages },
                            instance.config
                        );

                        for await (const chunk of agentStream) {
                            controller.enqueue(encoder.encode(`${JSON.stringify(chunk)}\n`));
                        }
                        controller.close();
                    } catch (error) {
                        console.error('Error in stream:', error);
                        controller.enqueue(
                            encoder.encode(
                                `${JSON.stringify({
                                    error: error instanceof Error ? error.message : 'Unknown streaming error'
                                })}\n`
                            )
                        );
                        controller.close();
                    }
                }
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'application/json',
                    'Transfer-Encoding': 'chunked'
                }
            });
        }

        const body = await request.json();
        const { privateKey } = body;

        if (!privateKey) {
            return NextResponse.json({
                success: false,
                error: 'Private key is required'
            }, { status: 400 });
        }

        if (!agentInstances.has(privateKey)) {
            const initializeAgent = await getAgentInitializer();
            const result = await initializeAgent(privateKey);
            agentInstances.set(privateKey, result);
        }

        const instance = agentInstances.get(privateKey);

        return NextResponse.json({
            success: true,
            config: instance.config
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
} 