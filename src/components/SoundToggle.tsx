"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SoundToggleProps {
  onSoundChange?: (enabled: boolean) => void;
}

export default function SoundToggle({ onSoundChange }: SoundToggleProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Load sound preference from localStorage
    const savedSoundPreference = localStorage.getItem('pacman-sound-enabled');
    if (savedSoundPreference !== null) {
      const enabled = JSON.parse(savedSoundPreference);
      setSoundEnabled(enabled);
      onSoundChange?.(enabled);
    }
  }, [onSoundChange]);

  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    localStorage.setItem('pacman-sound-enabled', JSON.stringify(newSoundState));
    onSoundChange?.(newSoundState);
  };

  return (
    <Button
      onClick={toggleSound}
      variant={soundEnabled ? "default" : "outline"}
      size="sm"
      className={`font-medium transition-colors ${
        soundEnabled 
          ? "bg-green-500 hover:bg-green-600 text-white" 
          : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
      }`}
    >
      {soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF"}
    </Button>
  );
}
