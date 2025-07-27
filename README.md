# 🎮 Multiplayer Pac-Mon Arena

A blockchain-powered multiplayer Pac-Man game built on the Monad testnet. Players register with unique usernames, pay 0.25 MON, and compete in real-time multiplayer battles.

## 🚀 Features

- **Blockchain Integration**: Built on Monad testnet with smart contract registration
- **Multiplayer Gameplay**: Real-time multiplayer with elimination mechanics
- **Wallet Connection**: MetaMask integration with automatic network switching
- **Modern UI**: Clean, responsive design with glassmorphism effects
- **Sound System**: Toggle-able audio effects for enhanced gameplay
- **Power-ups**: Special elimination power-ups that spawn every 10 seconds

## 🛠 Tech Stack

- **Frontend**: Next.js 15.3.2 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Blockchain**: Ethers.js for smart contract interaction
- **Smart Contracts**: Solidity with Hardhat
- **Deployment**: Optimized for Vercel

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_MULTISYNQ_API_KEY=your_multisynq_api_key
   NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=your_contract_address
   NEXT_PUBLIC_PAYMENT_ADDRESS=your_payment_address
   PRIVATE_KEY=your_private_key
   ```

## 🚀 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

## 🏗 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_MULTISYNQ_API_KEY`
   - `NEXT_PUBLIC_GAME_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_PAYMENT_ADDRESS`
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
vercel --prod
```

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and connect your MetaMask
2. **Switch Network**: Automatically switches to Monad testnet
3. **Register**: Enter a unique username and pay 0.25 MON
4. **Play**: Use WASD or arrow keys to move
5. **Collect**: Gather pellets (10 points) and power pellets (50 points)
6. **Eliminate**: Collect purple power-ups to eliminate other players
7. **Compete**: Climb the leaderboard and dominate the arena!

## 🔧 Smart Contract

The game uses a smart contract deployed on Monad testnet for:
- Player registration with unique usernames
- Payment processing (0.25 MON registration fee)
- Username availability checking
- Game state management

## 📱 Responsive Design

The game is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds with glassmorphism effects
- **Clean Typography**: Google Fonts integration
- **Accessible**: Proper contrast ratios and keyboard navigation
- **Smooth Animations**: CSS transitions and hover effects
- **Toast Notifications**: Real-time feedback for user actions

## 🔒 Security

- Environment variables for sensitive data
- Proper error handling for blockchain interactions
- Input validation for usernames
- Secure wallet connection handling

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Bug Reports

If you find any bugs, please open an issue with detailed information about the problem.

---

**Built with ❤️ for the Monad blockchain ecosystem**
