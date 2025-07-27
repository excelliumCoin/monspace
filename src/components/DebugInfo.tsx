"use client";
import React from "react";

export default function DebugInfo() {
  const envVars = {
    MULTISYNQ_API_KEY: process.env.NEXT_PUBLIC_MULTISYNQ_API_KEY,
    GAME_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS,
    PAYMENT_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS
  };

  React.useEffect(() => {
    console.log('🔍 Environment Variables Debug:');
    console.log('NEXT_PUBLIC_MULTISYNQ_API_KEY:', envVars.MULTISYNQ_API_KEY ? 'SET ✅' : 'NOT SET ❌');
    console.log('NEXT_PUBLIC_GAME_CONTRACT_ADDRESS:', envVars.GAME_CONTRACT_ADDRESS ? 'SET ✅' : 'NOT SET ❌');
    console.log('NEXT_PUBLIC_PAYMENT_ADDRESS:', envVars.PAYMENT_ADDRESS ? 'SET ✅' : 'NOT SET ❌');
    console.log('Contract Address Value:', envVars.GAME_CONTRACT_ADDRESS);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Debug Info</h3>
      <div className="space-y-1">
        <div>API Key: {envVars.MULTISYNQ_API_KEY ? '✅ SET' : '❌ NOT SET'}</div>
        <div>Contract: {envVars.GAME_CONTRACT_ADDRESS ? '✅ SET' : '❌ NOT SET'}</div>
        <div>Payment: {envVars.PAYMENT_ADDRESS ? '✅ SET' : '❌ NOT SET'}</div>
        {envVars.GAME_CONTRACT_ADDRESS && (
          <div className="text-xs text-gray-300 mt-2">
            Contract: {envVars.GAME_CONTRACT_ADDRESS.substring(0, 10)}...
          </div>
        )}
      </div>
    </div>
  );
}
