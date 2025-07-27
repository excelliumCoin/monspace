"use client";
import React from "react";

export default function DebugPage() {
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
    console.log('Values:', envVars);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Environment Variables Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Status</h2>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={envVars.MULTISYNQ_API_KEY ? 'text-green-400' : 'text-red-400'}>
                {envVars.MULTISYNQ_API_KEY ? '✅' : '❌'}
              </span>
              <span>NEXT_PUBLIC_MULTISYNQ_API_KEY</span>
              {envVars.MULTISYNQ_API_KEY && (
                <span className="text-gray-400 text-sm">
                  ({envVars.MULTISYNQ_API_KEY.substring(0, 10)}...)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={envVars.GAME_CONTRACT_ADDRESS ? 'text-green-400' : 'text-red-400'}>
                {envVars.GAME_CONTRACT_ADDRESS ? '✅' : '❌'}
              </span>
              <span>NEXT_PUBLIC_GAME_CONTRACT_ADDRESS</span>
              {envVars.GAME_CONTRACT_ADDRESS && (
                <span className="text-gray-400 text-sm">
                  ({envVars.GAME_CONTRACT_ADDRESS})
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={envVars.PAYMENT_ADDRESS ? 'text-green-400' : 'text-red-400'}>
                {envVars.PAYMENT_ADDRESS ? '✅' : '❌'}
              </span>
              <span>NEXT_PUBLIC_PAYMENT_ADDRESS</span>
              {envVars.PAYMENT_ADDRESS && (
                <span className="text-gray-400 text-sm">
                  ({envVars.PAYMENT_ADDRESS})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>1. Check the console (F12) for detailed logs</p>
            <p>2. If any variables show ❌, they are not set in Vercel</p>
            <p>3. Go to Vercel Dashboard → Settings → Environment Variables</p>
            <p>4. Add the missing variables and redeploy</p>
            <p>5. Clear browser cache and reload this page</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Expected Values</h2>
          <div className="space-y-1 text-sm font-mono">
            <p>NEXT_PUBLIC_MULTISYNQ_API_KEY = 2T3Pz87uuBgottPaS78miDAfbcCgl07ivyk6EkNTqq</p>
            <p>NEXT_PUBLIC_GAME_CONTRACT_ADDRESS = 0x7bD82A8A4DB51562d4547FD976Adf9653D3F817D</p>
            <p>NEXT_PUBLIC_PAYMENT_ADDRESS = 0x76914803b100Df11D1329e7F916F83B72bb4A508</p>
          </div>
        </div>

        <div className="bg-blue-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🚨 If Variables Are Missing</h2>
          <p className="text-sm">
            The "Wallet not connected or contract not available" error occurs because 
            the NEXT_PUBLIC_GAME_CONTRACT_ADDRESS is undefined. Set the environment 
            variables in Vercel and redeploy.
          </p>
        </div>
      </div>
    </div>
  );
}
