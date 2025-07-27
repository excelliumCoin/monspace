# 🚨 Vercel Deployment Troubleshooting Guide

## Issue: "Wallet not connected or contract not available"

This error occurs when either:
1. The wallet is not properly connected
2. The smart contract address environment variable is not set correctly
3. The signer is not available

## 🔍 Debugging Steps

### Step 1: Check Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Verify these variables exist and have correct values:

```
NEXT_PUBLIC_MULTISYNQ_API_KEY = 2T3Pz87uuBgottPaS78miDAfbcCgl07ivyk6EkNTqq
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS = 0x7bD82A8A4DB51562d4547FD976Adf9653D3F817D
NEXT_PUBLIC_PAYMENT_ADDRESS = 0x76914803b100Df11D1329e7F916F83B72bb4A508
```

### Step 2: Redeploy After Setting Variables
- After adding/updating environment variables, you MUST redeploy
- Go to Deployments tab → Click "..." → Redeploy

### Step 3: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check if environment variables are loaded:
   ```javascript
   console.log('Contract Address:', process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS)
   ```

### Step 4: Verify Wallet Connection
1. Make sure MetaMask is installed
2. Connect to the correct network (Monad Testnet)
3. Ensure wallet is unlocked

## 🔧 Quick Fixes

### Fix 1: Environment Variables Not Loading
If environment variables are undefined:
1. Ensure they start with `NEXT_PUBLIC_`
2. Redeploy after adding variables
3. Clear browser cache and reload

### Fix 2: Network Issues
1. Switch to Monad Testnet in MetaMask
2. Add Monad Testnet if not present:
   - Network Name: Monad Testnet
   - RPC URL: https://testnet-rpc.monad.xyz
   - Chain ID: 10143
   - Currency Symbol: MON
   - Block Explorer: https://testnet.monadexplorer.com

### Fix 3: Contract Address Issues
Verify the contract address is correct:
- Current: `0x7bD82A8A4DB51562d4547FD976Adf9653D3F817D`
- Should be exactly 42 characters (including 0x)
- No extra spaces or characters

## 🧪 Testing Environment Variables

Add this temporary debug code to check if variables are loaded:

```javascript
// Add to the top of your component
console.log('Environment Variables Check:');
console.log('MULTISYNQ_API_KEY:', process.env.NEXT_PUBLIC_MULTISYNQ_API_KEY ? 'SET' : 'NOT SET');
console.log('GAME_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS ? 'SET' : 'NOT SET');
console.log('PAYMENT_ADDRESS:', process.env.NEXT_PUBLIC_PAYMENT_ADDRESS ? 'SET' : 'NOT SET');
```

## 🚀 Complete Fix Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] All 3 variables have correct values
- [ ] Variables start with `NEXT_PUBLIC_`
- [ ] Redeployed after setting variables
- [ ] MetaMask installed and connected
- [ ] Connected to Monad Testnet (Chain ID: 10143)
- [ ] Browser cache cleared
- [ ] No console errors in browser

## 📞 If Still Not Working

1. Check Vercel deployment logs for build errors
2. Verify the smart contract is deployed and accessible
3. Test with a different wallet address
4. Check if the Monad testnet RPC is responding

## 🔄 Emergency Reset Steps

If nothing works:
1. Delete all environment variables in Vercel
2. Re-add them one by one
3. Redeploy
4. Clear browser cache completely
5. Reconnect wallet

The error should resolve once environment variables are properly set and the deployment is refreshed.
