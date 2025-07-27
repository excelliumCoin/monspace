"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getGameState, updatePlayerState, PlayerState } from "@/lib/multisynq";

// Constants moved outside component to avoid dependency issues
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 20;
const COLS = CANVAS_WIDTH / CELL_SIZE;
const ROWS = CANVAS_HEIGHT / CELL_SIZE;

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

interface GameState {
  players: Player[];
  pellets: { x: number; y: number; collected: boolean }[];
  powerPellets: { x: number; y: number; collected: boolean }[];
  eliminationPowerUps: { x: number; y: number; collected: boolean; spawnTime: number }[];
  gameStarted: boolean;
  gameOver: boolean;
  eliminatedPlayers: Set<string>;
}

interface PacManGameProps {
  soundEnabled: boolean;
  currentPlayer?: Player | null;
  onScoreUpdate?: (score: number) => void;
  onPlayersUpdate?: (players: Player[]) => void;
}

export default function PacManGame({ 
  soundEnabled, 
  currentPlayer, 
  onScoreUpdate,
  onPlayersUpdate 
}: PacManGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set<string>());
  const lastUpdateRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    pellets: [],
    powerPellets: [],
    eliminationPowerUps: [],
    gameStarted: false,
    gameOver: false,
    eliminatedPlayers: new Set()
  });

  // Game maze layout (1 = wall, 0 = path, 2 = pellet, 3 = power pellet)
  const maze = useRef<number[][]>([]);

  // Sound effects
  const playSound = useCallback((soundType: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (soundType) {
        case 'pellet':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          break;
        case 'powerPellet':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          break;
        case 'elimination':
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          break;
        case 'move':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          break;
      }
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [soundEnabled]);

  // Initialize maze
  const initializeMaze = useCallback(() => {
    const newMaze: number[][] = [];
    
    for (let row = 0; row < ROWS; row++) {
      newMaze[row] = [];
      for (let col = 0; col < COLS; col++) {
        if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
          newMaze[row][col] = 1; // Wall
        } else if ((row % 4 === 0 && col % 6 === 0) || (row % 6 === 0 && col % 4 === 0)) {
          newMaze[row][col] = 1; // Internal walls
        } else if (Math.random() < 0.05) {
          newMaze[row][col] = 3; // Power pellet
        } else if (Math.random() < 0.7) {
          newMaze[row][col] = 2; // Regular pellet
        } else {
          newMaze[row][col] = 0; // Empty path
        }
      }
    }
    
    maze.current = newMaze;
    
    const pellets: { x: number; y: number; collected: boolean }[] = [];
    const powerPellets: { x: number; y: number; collected: boolean }[] = [];
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (newMaze[row][col] === 2) {
          pellets.push({ x: col * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2, collected: false });
        } else if (newMaze[row][col] === 3) {
          powerPellets.push({ x: col * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2, collected: false });
        }
      }
    }
    
    setGameState(prev => ({ ...prev, pellets, powerPellets, eliminationPowerUps: [] }));
  }, []);

  // Initialize player
  const initializePlayer = useCallback(() => {
    if (!currentPlayer) return;
    
    const player: Player = {
      ...currentPlayer,
      x: CELL_SIZE * 2,
      y: CELL_SIZE * 2,
      direction: "right",
      originalColor: currentPlayer.color,
      score: 0,
      isPoweredUp: false,
      powerUpEndTime: 0
    };
    
    setGameState(prev => ({
      ...prev,
      players: [player],
      gameStarted: true
    }));
  }, [currentPlayer]);

  // Poll global multiplayer state
  useEffect(() => {
    if (!gameState.gameStarted) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await getGameState();
        if (res.success && res.data) {
          const gameData = res.data as { players?: Player[] };
          if (gameData.players) {
            setGameState(prevState => {
              const globalPlayers = gameData.players as Player[];
              const currentPlayerId = currentPlayer?.id;
              
              const mergedPlayers = globalPlayers.map((globalPlayer: Player) => {
                if (globalPlayer.id === currentPlayerId) {
                  const localPlayer = prevState.players.find(p => p.id === currentPlayerId);
                  return localPlayer || globalPlayer;
                }
                return globalPlayer;
              });

              return {
                ...prevState,
                players: mergedPlayers
              };
            });
          }
        }
      } catch (error) {
        console.error("Error polling game state:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [gameState.gameStarted, currentPlayer?.id]);

  // Spawn elimination power-ups every 10 seconds
  useEffect(() => {
    if (!gameState.gameStarted) return;

    const spawnInterval = setInterval(() => {
      setGameState(prev => {
        let x, y, attempts = 0;
        do {
          x = Math.floor(Math.random() * (COLS - 2)) + 1;
          y = Math.floor(Math.random() * (ROWS - 2)) + 1;
          attempts++;
        } while (maze.current[y] && maze.current[y][x] === 1 && attempts < 50);

        if (attempts < 50) {
          const newPowerUp = {
            x: x * CELL_SIZE + CELL_SIZE / 2,
            y: y * CELL_SIZE + CELL_SIZE / 2,
            collected: false,
            spawnTime: Date.now()
          };

          return {
            ...prev,
            eliminationPowerUps: [...prev.eliminationPowerUps, newPowerUp]
          };
        }
        return prev;
      });
    }, 10000);

    return () => clearInterval(spawnInterval);
  }, [gameState.gameStarted]);

  // Update parent component with players list
  useEffect(() => {
    if (onPlayersUpdate) {
      onPlayersUpdate(gameState.players);
    }
  }, [gameState.players, onPlayersUpdate]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw maze
    ctx.fillStyle = '#0f3460';
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (maze.current[row] && maze.current[row][col] === 1) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw pellets
    gameState.pellets.forEach(pellet => {
      if (!pellet.collected) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw power pellets
    const time = Date.now() * 0.005;
    gameState.powerPellets.forEach(powerPellet => {
      if (!powerPellet.collected) {
        const pulseSize = 10 + Math.sin(time) * 1;
        const outerSize = pulseSize + 4;
        const innerSize = pulseSize - 2;
        
        // Draw outer purple rounded square
        ctx.fillStyle = '#8b5cf6';
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 15;
        
        ctx.save();
        ctx.translate(powerPellet.x, powerPellet.y);
        ctx.rotate(Math.PI / 4); // Rotate 45 degrees to make it diamond-like
        
        // Outer rounded square
        ctx.beginPath();
        ctx.roundRect(-outerSize, -outerSize, outerSize * 2, outerSize * 2, outerSize * 0.3);
        ctx.fill();
        
        // Inner white rounded square
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.roundRect(-innerSize, -innerSize, innerSize * 2, innerSize * 2, innerSize * 0.3);
        ctx.fill();
        
        ctx.restore();
        ctx.shadowBlur = 0;
      }
    });

    // Draw elimination power-ups (auto-disappear after 10 seconds)
    gameState.eliminationPowerUps.forEach(eliminationPowerUp => {
      if (!eliminationPowerUp.collected) {
        const timeAlive = Date.now() - eliminationPowerUp.spawnTime;
        const timeLeft = 10000 - timeAlive;
        
        if (timeLeft > 0) {
          const pulseSize = 15 + Math.sin(time * 2) * 3;
          const opacity = timeLeft < 2000 ? timeLeft / 2000 : 1;
          const outerSize = pulseSize + 5;
          const innerSize = pulseSize - 3;
          
          // Draw outer purple rounded square
          ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`;
          ctx.shadowColor = `rgba(168, 85, 247, ${opacity})`;
          ctx.shadowBlur = 25;
          
          ctx.save();
          ctx.translate(eliminationPowerUp.x, eliminationPowerUp.y);
          ctx.rotate(Math.PI / 4); // Rotate 45 degrees to make it diamond-like
          
          // Outer rounded square
          ctx.beginPath();
          ctx.roundRect(-outerSize, -outerSize, outerSize * 2, outerSize * 2, outerSize * 0.3);
          ctx.fill();
          
          // Inner white rounded square
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.roundRect(-innerSize, -innerSize, innerSize * 2, innerSize * 2, innerSize * 0.3);
          ctx.fill();
          
          ctx.restore();
          ctx.shadowBlur = 0;
          
          // Draw countdown timer
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.ceil(timeLeft / 1000)}s`, eliminationPowerUp.x, eliminationPowerUp.y - 35);
        }
      }
    });

    // Update players
    setGameState(prev => {
      const newState = { ...prev };
      
      // Remove expired elimination power-ups
      newState.eliminationPowerUps = newState.eliminationPowerUps.filter(powerUp => {
        const timeAlive = Date.now() - powerUp.spawnTime;
        return powerUp.collected || timeAlive < 10000;
      });
      
      newState.players = newState.players.map(player => {
        const newPlayer = { ...player };
        
        if (player.id === currentPlayer?.id) {
          let newDirection = player.direction;
          
          if (keysRef.current.has('arrowup') || keysRef.current.has('w')) {
            newDirection = 'up';
          } else if (keysRef.current.has('arrowdown') || keysRef.current.has('s')) {
            newDirection = 'down';
          } else if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) {
            newDirection = 'left';
          } else if (keysRef.current.has('arrowright') || keysRef.current.has('d')) {
            newDirection = 'right';
          }
          
          let newX = player.x;
          let newY = player.y;
          const speed = 2;
          
          switch (newDirection) {
            case 'up': newY -= speed; break;
            case 'down': newY += speed; break;
            case 'left': newX -= speed; break;
            case 'right': newX += speed; break;
          }
          
          const gridX = Math.floor(newX / CELL_SIZE);
          const gridY = Math.floor(newY / CELL_SIZE);
          
          if (maze.current[gridY] && maze.current[gridY][gridX] !== 1) {
            newPlayer.x = newX;
            newPlayer.y = newY;
            newPlayer.direction = newDirection;
            
            if (newDirection !== player.direction) {
              playSound('move');
            }
          }
          
          // Check pellet collection
          newState.pellets.forEach(pellet => {
            if (!pellet.collected) {
              const distance = Math.sqrt(
                Math.pow(newPlayer.x - pellet.x, 2) + 
                Math.pow(newPlayer.y - pellet.y, 2)
              );
              
              if (distance < 15) {
                pellet.collected = true;
                newPlayer.score += 10;
                playSound('pellet');
                onScoreUpdate?.(newPlayer.score);
              }
            }
          });
          
          // Check power pellet collection
          newState.powerPellets.forEach(powerPellet => {
            if (!powerPellet.collected) {
              const distance = Math.sqrt(
                Math.pow(newPlayer.x - powerPellet.x, 2) + 
                Math.pow(newPlayer.y - powerPellet.y, 2)
              );
              
              if (distance < 20) {
                powerPellet.collected = true;
                newPlayer.score += 50;
                playSound('powerPellet');
                onScoreUpdate?.(newPlayer.score);
              }
            }
          });

          // Check elimination power-up collection (only if still alive)
          newState.eliminationPowerUps.forEach(eliminationPowerUp => {
            if (!eliminationPowerUp.collected) {
              const timeAlive = Date.now() - eliminationPowerUp.spawnTime;
              const timeLeft = 10000 - timeAlive;
              
              if (timeLeft > 0) {
                const distance = Math.sqrt(
                  Math.pow(newPlayer.x - eliminationPowerUp.x, 2) + 
                  Math.pow(newPlayer.y - eliminationPowerUp.y, 2)
                );
                
                if (distance < 25) {
                  eliminationPowerUp.collected = true;
                  newPlayer.score += 100;
                  playSound('elimination');
                  onScoreUpdate?.(newPlayer.score);
                  
                  newPlayer.isPoweredUp = true;
                  newPlayer.powerUpEndTime = Date.now() + 10000;
                  newPlayer.color = '#a855f7';
                }
              }
            }
          });

          // Check for collisions with other players if powered up
          if (newPlayer.isPoweredUp) {
            newState.players.forEach(otherPlayer => {
              if (otherPlayer.id !== newPlayer.id) {
                const distance = Math.sqrt(
                  Math.pow(newPlayer.x - otherPlayer.x, 2) + 
                  Math.pow(newPlayer.y - otherPlayer.y, 2)
                );
                
                if (distance < 30) {
                  newState.eliminatedPlayers.add(otherPlayer.id);
                  newPlayer.score += 200;
                  playSound('elimination');
                  onScoreUpdate?.(newPlayer.score);
                }
              }
            });
          }

          // Check if power-up time has expired
          if (newPlayer.isPoweredUp && Date.now() > newPlayer.powerUpEndTime) {
            newPlayer.isPoweredUp = false;
            newPlayer.color = newPlayer.originalColor;
          }

          // Send player state to server
          const now = Date.now();
          if (now - lastUpdateRef.current > 1000) {
            lastUpdateRef.current = now;
            const playerState: PlayerState = {
              id: newPlayer.id,
              x: newPlayer.x,
              y: newPlayer.y,
              direction: newPlayer.direction,
              username: newPlayer.username,
              color: newPlayer.color,
              score: newPlayer.score
            };
            
            updatePlayerState(playerState)
              .then(res => {
                if (!res.success) {
                  console.error("Failed to update player state:", res.error);
                }
              })
              .catch(err => console.error("Error in updatePlayerState:", err));
          }
        }
        
        return newPlayer;
      });

      // Remove eliminated players
      newState.players = newState.players.filter(p => 
        !newState.eliminatedPlayers.has(p.id)
      );
      
      return newState;
    });

    // Draw players
    gameState.players.forEach(player => {
      const playerSize = player.isPoweredUp ? 18 : 15;
      ctx.fillStyle = player.color || '#ffff00';
      
      let mouthDirection = 0;
      switch (player.direction) {
        case 'up': mouthDirection = -Math.PI / 2; break;
        case 'down': mouthDirection = Math.PI / 2; break;
        case 'left': mouthDirection = Math.PI; break;
        case 'right': mouthDirection = 0; break;
      }
      
      const mouthAngle = (Date.now() * 0.01) % (Math.PI * 2);
      const mouthOpenness = Math.abs(Math.sin(mouthAngle)) * 0.5;
      
      const startAngle = mouthDirection + mouthOpenness;
      const endAngle = mouthDirection - mouthOpenness + Math.PI * 2;
      
      ctx.beginPath();
      ctx.arc(player.x, player.y, playerSize, startAngle, endAngle);
      ctx.lineTo(player.x, player.y);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowColor = player.color || '#ffff00';
      ctx.shadowBlur = player.isPoweredUp ? 30 : 20;
      ctx.beginPath();
      ctx.arc(player.x, player.y, playerSize, startAngle, endAngle);
      ctx.lineTo(player.x, player.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      
      if (player.isPoweredUp) {
        const timeLeft = player.powerUpEndTime - Date.now();
        const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        
        ctx.strokeStyle = `rgba(168, 85, 247, ${pulseIntensity})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(player.x, player.y, playerSize + 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(timeLeft / 1000)}s`, player.x, player.y - 35);
      }
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(player.username, player.x, player.y - 25);
      ctx.fillText(`Score: ${player.score}`, player.x, player.y + 35);
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, currentPlayer, playSound, onScoreUpdate]);

  // Initialize game
  useEffect(() => {
    initializeMaze();
  }, [initializeMaze]);

  useEffect(() => {
    if (currentPlayer && !gameState.gameStarted) {
      initializePlayer();
    }
  }, [currentPlayer, gameState.gameStarted, initializePlayer]);

  // Start game loop
  useEffect(() => {
    if (gameState.gameStarted) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameStarted, gameLoop]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg shadow-2xl">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-white text-center mb-1">
          Multiplayer Pac-Mon Arena
        </h2>
        {!gameState.gameStarted && (
          <p className="text-gray-300 text-center text-sm">
            Register and pay 0.25 MON to start playing!
          </p>
        )}
        {gameState.gameStarted && (
          <p className="text-gray-300 text-center text-sm">
            Use WASD or Arrow Keys to move • Touch others while purple to eliminate!
          </p>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-blue-500 rounded-lg shadow-lg bg-gray-800 max-w-full max-h-full"
        style={{ 
          imageRendering: 'pixelated',
          filter: 'contrast(1.1) brightness(1.1)'
        }}
      />
      
      <div className="mt-3 text-center">
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-300">
          <span>Pellets: {gameState.pellets.filter(p => !p.collected).length}</span>
          <span>Power Pellets: {gameState.powerPellets.filter(p => !p.collected).length}</span>
          <span>Elimination Power-ups: {gameState.eliminationPowerUps.filter(p => !p.collected && Date.now() - p.spawnTime < 10000).length}</span>
          <span>Players: {gameState.players.length}</span>
        </div>
      </div>
    </div>
  );
}
