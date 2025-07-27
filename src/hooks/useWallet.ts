"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletState {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export default function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false
  });

  const MONAD_TESTNET_CHAIN_ID = 10143;

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }));

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      // Check if we're on Monad testnet
      if (network.chainId !== MONAD_TESTNET_CHAIN_ID) {
        try {
          // Try to switch to Monad testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${MONAD_TESTNET_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: unknown) {
          // If the chain hasn't been added to MetaMask, add it
          if (switchError instanceof Error && (switchError as { code?: number }).code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${MONAD_TESTNET_CHAIN_ID.toString(16)}`,
                    chainName: 'Monad Testnet',
                    nativeCurrency: {
                      name: 'MON',
                      symbol: 'MON',
                      decimals: 18,
                    },
                    rpcUrls: ['https://testnet-rpc.monad.xyz'],
                    blockExplorerUrls: ['https://testnet.monadexplorer.com'],
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add Monad testnet:", addError);
              alert("Please manually add Monad testnet to your wallet");
              return;
            }
          } else {
            console.error("Failed to switch to Monad testnet:", switchError);
            alert("Please switch to Monad testnet in your wallet");
            return;
          }
        }
      }

      setWalletState({
        provider,
        signer,
        account,
        chainId: network.chainId,
        isConnected: true,
        isConnecting: false
      });

    } catch (error) {
      console.error("Wallet connection error:", error);
      setWalletState(prev => ({ 
        ...prev, 
        isConnecting: false,
        isConnected: false 
      }));
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
      isConnecting: false
    });
  };

  const getBalance = async (): Promise<string> => {
    if (!walletState.provider || !walletState.account) {
      return "0";
    }

    try {
      const balance = await walletState.provider.getBalance(walletState.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletState.account) {
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      const ethereum = window.ethereum;
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [walletState.account, walletState.isConnected]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && !walletState.isConnected) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if ((accounts as string[]).length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    };

    autoConnect();
  }, [walletState.isConnected]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getBalance
  };
}
