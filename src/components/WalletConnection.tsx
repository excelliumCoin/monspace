"use client";
import React, { useState, useEffect } from "react";
import useWallet from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

export default function WalletConnection() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    chainId, 
    connectWallet, 
    disconnectWallet, 
    getBalance 
  } = useWallet();
  
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    if (isConnected && account) {
      getBalance().then(setBalance);
    }
  }, [isConnected, account, getBalance]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  if (isConnected && account) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-md border">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-sm font-semibold text-gray-700">
            Connected: {formatAddress(account)}
          </span>
          <span className="text-xs text-gray-500">
            Balance: {formatBalance(balance)} MON
          </span>
          {chainId !== 10143 && (
            <span className="text-xs text-red-500">
              ⚠️ Please switch to Monad Testnet
            </span>
          )}
        </div>
        <Button
          onClick={disconnectWallet}
          variant="destructive"
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white font-medium"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center p-4">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
}
