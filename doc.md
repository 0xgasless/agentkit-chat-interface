# 0xGasless AgentKit Documentation for Beginners

## Table of Contents
1. [Introduction](#1-introduction)
2. [Prerequisites](#2-prerequisites)
3. [Project Setup](#3-project-setup)
4. [Core Components](#4-core-components)
5. [Implementation Guide](#5-implementation-guide)
6. [Features and Capabilities](#6-features-and-capabilities)
7. [Best Practices](#7-best-practices)
8. [Troubleshooting](#8-troubleshooting)
9. [Advanced Usage](#9-advanced-usage)

## 1. Introduction

0xGasless AgentKit is a powerful SDK that enables developers to build gasless blockchain applications on Binance Smart Chain (BSC). It leverages ERC-4337 account abstraction to allow users to interact with the blockchain without needing to hold BNB for gas fees.

### What is Account Abstraction?
Account abstraction (ERC-4337) is a revolutionary concept in blockchain that separates the account logic from the consensus layer. This means:
- Users don't need to hold native tokens (BNB) for gas fees
- Smart contracts can pay for transactions
- More flexible and user-friendly transaction handling

### Key Features:
- Gasless transactions on BSC
- Smart account management
- Token transfers and swaps
- Balance checking
- Transaction tracking

### How It Works
1. User initiates a transaction
2. The agent creates a UserOperation
3. The operation is bundled and submitted to the blockchain
4. The transaction is executed without requiring BNB for gas

## 2. Prerequisites

Before starting, ensure you have:

1. Node.js (v18 or higher)
   ```bash
   node --version  # Should show v18.x.x or higher
   ```

2. A code editor (VS Code recommended)
   - Install recommended extensions:
     - TypeScript and JavaScript Language Features
     - ESLint
     - Prettier

3. Basic understanding of:
   - React/Next.js
     - Components and hooks
     - Server-side rendering
     - API routes
   - TypeScript
     - Types and interfaces
     - Async/await
     - Error handling
   - Blockchain concepts
     - Smart contracts
     - Transactions
     - Gas fees
   - BSC network
     - Network configuration
     - RPC endpoints
     - Token standards

## 3. Project Setup

1. Create a new Next.js project:
```bash
npx create-next-app@latest my-gasless-app --typescript
cd my-gasless-app
```

2. Install required dependencies:
```bash
npm install @0xgasless/agentkit @langchain/core @langchain/langgraph @langchain/openai react-hot-toast
```

3. Configure environment variables in `.env.local`:
```env
# OpenRouter API key for AI model access
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key

# BSC RPC URL (use a reliable provider like Ankr, QuickNode, or Infura)
NEXT_PUBLIC_RPC_URL=your_bsc_rpc_url

# 0xGasless API key from dashboard
NEXT_PUBLIC_API_KEY=your_0xgasless_api_key

# BSC Mainnet Chain ID
NEXT_PUBLIC_CHAIN_ID=56
```

4. Create the project structure:
```
src/
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatInterface.tsx
│   └── Wallet.tsx
└── lib/
    └── agent.ts
```

## 4. Core Components

### 4.1 Agent Configuration (`src/lib/agent.ts`)
The agent is the core component that handles blockchain interactions:

```typescript
import { Agentkit, AgentkitToolkit } from "@0xgasless/agentkit";
import { ChatOpenAI } from "@langchain/openai";

// Store agent instances to prevent multiple initializations
const agentInstances = new Map();

async function createAgentInstance(privateKey: `0x${string}`) {
    // Initialize the AI model for natural language processing
    const llm = new ChatOpenAI({
        model: "openai/gpt-4o",
        openAIApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        configuration: {
            baseURL: "https://openrouter.ai/api/v1",
        },
    });

    // Configure the agent with wallet and network settings
    const agentkit = await Agentkit.configureWithWallet({
        privateKey,  // User's private key for signing transactions
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,  // BSC RPC endpoint
        apiKey: process.env.NEXT_PUBLIC_API_KEY,  // 0xGasless API key
        chainID: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 56,  // BSC Mainnet
    });

    // Create toolkit with available blockchain operations
    const toolkit = new AgentkitToolkit(agentkit);
    return toolkit.getTools();
}
```

### 4.2 API Route (`src/app/api/agent/route.ts`)
Handles agent initialization and chat interactions:

```typescript
import { NextRequest } from 'next/server';
import { getOrCreateAgent } from '../../../lib/agent';

export async function POST(request: NextRequest) {
    try {
        const { privateKey } = await request.json();
        
        // Validate private key
        if (!privateKey || !privateKey.startsWith('0x')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid private key format'
            }), { status: 400 });
        }

        // Get or create agent instance
        const instance = await getOrCreateAgent(privateKey);
        
        return new Response(JSON.stringify({
            success: true,
            config: instance.config
        }));
    } catch (error) {
        console.error('API error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }), { status: 500 });
    }
}
```

### 4.3 Chat Interface (`src/components/ChatInterface.tsx`)
User interface for interacting with the agent:

```typescript
import { useState, useRef } from 'react';

interface Message {
    role: 'user' | 'agent' | 'system';
    content: string;
    type?: 'loading' | 'transaction' | 'error';
}

export default function ChatInterface({ privateKey }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (message: string) => {
        try {
            setIsLoading(true);
            // Add user message
            setMessages(prev => [...prev, { role: 'user', content: message }]);
            
            // Send to API
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, privateKey })
            });

            const data = await response.json();
            
            // Add agent response
            setMessages(prev => [...prev, { 
                role: 'agent', 
                content: data.response 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                role: 'system', 
                type: 'error',
                content: error instanceof Error ? error.message : 'Unknown error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            {/* Chat UI implementation */}
        </div>
    );
}
```

## 5. Implementation Guide

### 5.1 Setting Up the Agent

1. Create the agent instance:
```typescript
// Initialize with user's private key
const agent = await createAgentInstance(privateKey);

// The agent is now ready to handle:
// - Token transfers
// - Balance checks
// - Smart contract interactions
// - Transaction tracking
```

2. Initialize the agent with configuration:
```typescript
const config = { 
    configurable: { 
        thread_id: "0xGasless AgentKit Chat",
        // Additional configuration options
        maxRetries: 3,
        timeout: 30000,
    } 
};
```

### 5.2 Handling Transactions

The agent supports various blockchain operations:

1. Check Token Balances:
```typescript
// USDC Balance
const usdcAddress = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const usdcBalance = await agent.check_balance({
    tokenAddress: usdcAddress
});

// USDT Balance
const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
const usdtBalance = await agent.check_balance({
    tokenAddress: usdtAddress
});

// WETH Balance
const wethAddress = "0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA";
const wethBalance = await agent.check_balance({
    tokenAddress: wethAddress
});
```

2. Perform Token Transfers:
```typescript
// Transfer USDC
const transferResult = await agent.transfer_tokens({
    tokenAddress: usdcAddress,
    amount: "1.0",
    recipient: recipientAddress
});

// Handle transfer result
if (transferResult.success) {
    console.log('Transfer successful!');
    console.log('Transaction hash:', transferResult.txHash);
} else {
    console.error('Transfer failed:', transferResult.error);
}
```

3. Execute Token Swaps:
```typescript
// Swap USDT to USDC
const swapResult = await agent.swap_tokens({
    fromToken: usdtAddress,
    toToken: usdcAddress,
    amount: "1.0"
});

// Monitor swap status
const status = await agent.check_transaction_status({
    opHash: swapResult.opHash
});
```

## 6. Features and Capabilities

### 6.1 Supported Operations
- Token balance checking
  - Real-time balance updates
  - Support for all BEP20 tokens
  - Historical balance tracking
- Gasless token transfers
  - No BNB required
  - Instant transaction confirmation
  - Transaction status tracking
- Token swaps without gas fees
  - Direct token-to-token swaps
  - Best price routing
  - Slippage protection
- Smart account creation
  - Custom account logic
  - Multi-signature support
  - Recovery mechanisms
- Transaction status tracking
  - Real-time updates
  - Detailed transaction info
  - Error handling
- DeBridge swaps
  - Cross-chain transfers
  - Bridge status monitoring
  - Fee optimization

### 6.2 Token Support
The agent supports major BSC tokens:
- USDC: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d`
- USDT: `0x55d398326f99059fF775485246999027B3197955`
- WETH: `0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA`

## 7. Best Practices

1. **Error Handling**:
   ```typescript
   try {
       const result = await agent.transfer_tokens({
           tokenAddress: usdcAddress,
           amount: "1.0",
           recipient: recipientAddress
       });
   } catch (error) {
       if (error instanceof InsufficientBalanceError) {
           // Handle insufficient balance
       } else if (error instanceof NetworkError) {
           // Handle network issues
       } else {
           // Handle other errors
       }
   }
   ```

2. **Security**:
   - Never expose private keys
   - Use environment variables
   - Implement proper session management
   - Add rate limiting
   - Validate all inputs

3. **Performance**:
   - Cache agent instances
   - Implement loading states
   - Use streaming for long operations
   - Optimize API calls
   - Handle timeouts properly

4. **User Experience**:
   - Clear feedback for transactions
   - Transaction status updates
   - Loading indicators
   - Error messages
   - Success confirmations

## 8. Troubleshooting

Common issues and solutions:

1. **Agent Initialization Failed**:
   - Check API keys
   - Verify RPC URL
   - Ensure network connectivity
   - Check Node.js version
   - Verify dependencies

2. **Transaction Failures**:
   - Verify token addresses
   - Check token balances
   - Ensure proper decimals
   - Verify network status
   - Check gas limits

3. **Network Issues**:
   - Verify BSC connectivity
   - Check RPC endpoint
   - Verify chain ID
   - Check network status
   - Monitor gas prices

## 9. Advanced Usage

### 9.1 Custom Smart Account Logic
```typescript
const customAccount = await agent.createSmartAccount({
    logic: {
        // Custom account logic
        validateTransaction: async (tx) => {
            // Custom validation
        },
        executeTransaction: async (tx) => {
            // Custom execution
        }
    }
});
```

### 9.2 Batch Transactions
```typescript
const batchResult = await agent.batchTransactions([
    {
        type: 'transfer',
        tokenAddress: usdcAddress,
        amount: "1.0",
        recipient: recipientAddress
    },
    {
        type: 'swap',
        fromToken: usdtAddress,
        toToken: usdcAddress,
        amount: "1.0"
    }
]);
```

### 9.3 Event Monitoring
```typescript
const unsubscribe = agent.subscribeToEvents({
    eventName: 'Transfer',
    callback: (event) => {
        console.log('Transfer event:', event);
    }
});

// Later, unsubscribe
unsubscribe();
```

## Contributing

We welcome contributions to improve this documentation. Please feel free to submit pull requests or open issues for any improvements or corrections.

## License

This documentation is licensed under the MIT License. See the LICENSE file for details.
