"use client";
import React, { useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import WalletConnection from "@/components/WalletConnection";
import SoundToggle from "@/components/SoundToggle";
import PacManGame from "@/components/PacManGame";
import useWallet from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Player {
  id: string;
  x: number;
  y: number;
  direction: string;
  username: string;
  color: string;
  originalColor: string;
  score: number;
  isPoweredUp: boolean;
  powerUpEndTime: number;
}

export default function GamePage() {
  const { account, signer, isConnected } = useWallet();
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playerScore, setPlayerScore] = useState(0);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);

  const gameContractAddress = process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS;
  const gameContractABI = useMemo(
    () => [
      "function register(string username) payable",
      "function getUsername(address player) view returns (string)",
      "function isUsernameAvailable(string username) view returns (bool)",
      "function startGame()",
      "event Registered(address indexed user, string username, uint256 timestamp)",
      "event GameStarted(address indexed player, string username)"
    ],
    []
  );

  const checkIfRegistered = useCallback(async () => {
    if (!signer || !gameContractAddress || !account) return;

    try {
      const contract = new ethers.Contract(gameContractAddress, gameContractABI, signer);
      const existingUsername = await contract.getUsername(account);
      
      if (existingUsername && existingUsername.length > 0) {
        setIsRegistered(true);
        setUsername(existingUsername);
        
        // Create player object
        const player: Player = {
          id: account,
          x: 0,
          y: 0,
          direction: "right",
          username: existingUsername,
          color: "#ffff00",
          originalColor: "#ffff00",
          score: 0,
          isPoweredUp: false,
          powerUpEndTime: 0
        };
        setCurrentPlayer(player);
        // Removed the recurring toast notification
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  }, [signer, gameContractAddress, account, gameContractABI]);

  React.useEffect(() => {
    if (isConnected && account) {
      checkIfRegistered();
    }
  }, [isConnected, account, checkIfRegistered]);

  const registerUser = async () => {
    if (!signer || !gameContractAddress) {
      toast.error("Wallet not connected or contract not available");
      return;
    }

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (username.length > 20) {
      toast.error("Username must be 20 characters or less");
      return;
    }

    try {
      setIsRegistering(true);
      
      const contract = new ethers.Contract(gameContractAddress, gameContractABI, signer);
      
      // Check if username is available
      const isAvailable = await contract.isUsernameAvailable(username);
      if (!isAvailable) {
        toast.error("Username is already taken. Please choose another one.");
        setIsRegistering(false);
        return;
      }

      toast.info("Sending registration transaction...");
      
      // Register with 0.25 MON payment
      const tx = await contract.register(username, {
        value: ethers.utils.parseEther("0.25"),
        gasLimit: 300000
      });

      toast.info("Transaction sent. Waiting for confirmation...");
      await tx.wait();

      // Create player object
      const player: Player = {
        id: account!,
        x: 0,
        y: 0,
        direction: "right",
        username: username,
        color: "#ffff00",
        originalColor: "#ffff00",
        score: 0,
        isPoweredUp: false,
        powerUpEndTime: 0
      };

      setCurrentPlayer(player);
      setIsRegistered(true);
      toast.success(`Registration successful! Welcome, ${username}!`);

    } catch (error: unknown) {
      console.error("Registration error:", error);
      
      if (error instanceof Error) {
        const ethError = error as { code?: number; reason?: string }; // For ethers.js specific error properties
        if (ethError.code === 4001) {
          toast.error("Transaction rejected by user");
        } else if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds. You need at least 0.25 MON plus gas fees.");
        } else if (error.message.includes("User already registered")) {
          toast.error("You are already registered!");
        } else if (error.message.includes("Username already taken")) {
          toast.error("Username is already taken. Please choose another one.");
        } else {
          toast.error("Registration failed: " + (ethError.reason || error.message || "Unknown error"));
        }
      } else {
        toast.error("Registration failed: Unknown error");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const startGame = async () => {
    if (!signer || !gameContractAddress || !isRegistered) {
      toast.error("Please register first");
      return;
    }

    try {
      const contract = new ethers.Contract(gameContractAddress, gameContractABI, signer);
      const tx = await contract.startGame();
      await tx.wait();
      toast.success("Game started! Use WASD or arrow keys to move.");
    } catch (error: unknown) {
      console.error("Start game error:", error);
      if (error instanceof Error) {
        const ethError = error as { reason?: string }; // For ethers.js specific error properties
        toast.error("Failed to start game: " + (ethError.reason || error.message || "Unknown error"));
      } else {
        toast.error("Failed to start game: Unknown error");
      }
    }
  };

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled);
  };

  const handleScoreUpdate = (score: number) => {
    setPlayerScore(score);
  };

  const handlePlayersUpdate = (players: Player[]) => {
    setActivePlayers(players);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                🎮 Multiplayer Pac-Mon Arena
              </h1>
              <p className="text-gray-300 text-xs lg:text-sm">
                Powered by Monad Blockchain • Play, Earn, Compete
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <SoundToggle onSoundChange={handleSoundChange} />
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {!isConnected ? (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Welcome to Pac-Mon Arena!</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect your wallet to start playing
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-4">
                  • Register with a unique username<br/>
                  • Pay 0.25 MON to start playing<br/>
                  • Compete with other players<br/>
                  • Collect pellets and power-ups
                </p>
              </CardContent>
            </Card>
          </div>
        ) : !isRegistered ? (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-xl">Register to Play</CardTitle>
                <CardDescription className="text-gray-300">
                  Choose a unique username and pay 0.25 MON to join the game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    disabled={isRegistering}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Max 20 characters. Must be unique.
                  </p>
                </div>
                
                <Button
                  onClick={registerUser}
                  disabled={isRegistering || !username.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isRegistering ? "Registering..." : "Register & Pay 0.25 MON"}
                </Button>
                
                <div className="text-center text-sm text-gray-400">
                  <p>Registration fee: 0.25 MON</p>
                  <p>Plus network gas fees</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex gap-4">
            {/* Left Side - How to Play */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 flex-shrink-0 w-64">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2 text-sm pt-0">
                <p>🎮 <strong>Controls:</strong> Use WASD keys or Arrow keys to move</p>
                <p>🟡 <strong>Pellets:</strong> Collect yellow pellets for 10 points each</p>
                <p>🔴 <strong>Power Pellets:</strong> Collect red power pellets for 50 points each</p>
                <p>🟣 <strong>Purple Power-up:</strong> Turn purple for 10 seconds!</p>
                <p>💀 <strong>Elimination:</strong> Touch others while purple to eliminate them</p>
                <p>💰 <strong>Registration:</strong> Pay 0.25 MON to join the game</p>
                <p>🔊 <strong>Sound:</strong> Toggle audio effects on/off</p>
              </CardContent>
            </Card>

            {/* Center - Game Canvas */}
            <div className="flex-1 flex items-center justify-center">
              <PacManGame
                soundEnabled={soundEnabled}
                currentPlayer={currentPlayer}
                onScoreUpdate={handleScoreUpdate}
                onPlayersUpdate={handlePlayersUpdate}
              />
            </div>

            {/* Right Side - Active Players & Game Info */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 flex-shrink-0 w-64">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Active Players</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3 text-sm pt-0">
                {/* Current Player Info */}
                <div className="text-center pb-3 border-b border-white/20">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">🎮 {username}</h3>
                  <p className="text-2xl font-bold text-green-400">{playerScore} Points</p>
                </div>
                
                {/* Active Players List */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activePlayers.length > 0 ? (
                    activePlayers.map((player) => (
                      <div 
                        key={player.id} 
                        className={`flex justify-between items-center text-xs p-2 rounded ${
                          player.id === currentPlayer?.id 
                            ? 'bg-blue-600 bg-opacity-50 border border-blue-400' 
                            : 'bg-gray-700 bg-opacity-50'
                        } ${
                          player.isPoweredUp ? 'border-purple-400 bg-purple-600 bg-opacity-30' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-white"
                            style={{ backgroundColor: player.color }}
                          ></div>
                          <span className="text-white font-medium truncate max-w-16">
                            {player.username}
                          </span>
                          {player.id === currentPlayer?.id && (
                            <span className="text-yellow-400 text-xs">(You)</span>
                          )}
                          {player.isPoweredUp && (
                            <span className="text-purple-300 text-xs">⚡</span>
                          )}
                        </div>
                        <span className="text-green-400 font-bold ml-2">
                          {player.score}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center">No active players</p>
                  )}
                </div>
                
                {/* Game Controls */}
                <div className="pt-3 border-t border-white/20">
                  <Button
                    onClick={startGame}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 mb-3"
                  >
                    Start New Game
                  </Button>
                  
                  {/* Game Rules */}
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>🟣 <strong>Purple Power-up:</strong> Turns you purple for 10s!</p>
                    <p>⚡ Appears every 10 seconds</p>
                    <p>💀 Touch others while purple to eliminate</p>
                    <p>🔄 Eliminated players must restart</p>
                  </div>
                  
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-400">Powered by Monad Blockchain</p>
                    <p className="text-xs text-yellow-400">Power-Up Battle Mode!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 flex-shrink-0">
        <div className="container mx-auto px-4 py-2 text-center">
          <p className="text-gray-400 text-xs">
            Built on Monad Testnet • Smart Contract: {gameContractAddress ? 
              `${gameContractAddress.substring(0, 6)}...${gameContractAddress.slice(-4)}` : 
              'Not deployed'
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
