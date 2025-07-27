// Multisynq API integration for Monad blockchain
const API_KEY = process.env.NEXT_PUBLIC_MULTISYNQ_API_KEY;

export interface TransactionData {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface MultisynqResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: unknown;
}

export async function sendTransaction(txData: TransactionData): Promise<MultisynqResponse> {
  try {
    // Note: This is a placeholder for Multisynq API integration
    // The actual endpoint and request format would depend on Multisynq's documentation
    const response = await fetch('https://api.multisynq.io/v1/transaction', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Chain-ID": "10143" // Monad testnet chain ID
      },
      body: JSON.stringify({
        chainId: 10143,
        transaction: txData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      transactionHash: result.hash,
      data: result
    };
  } catch (error) {
    console.error("Multisynq API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function getTransactionStatus(txHash: string): Promise<MultisynqResponse> {
  try {
    const response = await fetch(`https://api.multisynq.io/v1/transaction/${txHash}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "X-Chain-ID": "10143"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Multisynq API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Define the player state interface for multiplayer
export interface PlayerState {
  id: string;
  x: number;
  y: number;
  direction: string;
  username: string;
  color: string;
  score: number;
}

export async function updatePlayerState(player: PlayerState): Promise<MultisynqResponse> {
  try {
    const response = await fetch('https://api.multisynq.io/v1/game/update', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Chain-ID": "10143"
      },
      body: JSON.stringify({ player })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      transactionHash: result.hash,
      data: result
    };
  } catch (error) {
    console.error("updatePlayerState error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function getGameState(): Promise<MultisynqResponse> {
  try {
    // Get multiplayer game state including all active players
    const response = await fetch('https://api.multisynq.io/v1/game/state', {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "X-Chain-ID": "10143"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Multisynq API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
