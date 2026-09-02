# PayTrust

> **Secure payments. Trustless milestones.**

PayTrust is a decentralized, milestone-based escrow protocol built on **Arbitrum Sepolia** that solves the fundamental trust dilemma between clients and freelancers through smart contract-enforced payments and automated **0.05% protocol fee** accounting.

---

## 1. Problem

In the modern gig economy, trust between clients and freelancers is broken:

- **Clients worry:** *"What if I pay upfront and the freelancer abandons the project or never finishes the work?"*
- **Freelancers worry:** *"What if I finish the deliverables and the client ghosts, refuses to pay, or files bad-faith disputes?"*
- **Centralized middleman extraction:** Traditional freelancing platforms charge **10% to 20%** in commission fees, withhold worker payouts for weeks, and act as opaque intermediaries with centralized dispute bias.

---

## 2. Solution

PayTrust replaces centralized trust with immutable code on Arbitrum:

```text
Client creates project
        ↓
Client adds freelancer wallet
        ↓
Client defines milestones and ETH amounts
        ↓
Client funds the project
        ↓
Funds are locked in smart contract
        ↓
Freelancer submits milestone
        ↓
Client approves milestone
        ↓
Smart contract automatically distributes payment
        ↓
99.95% → Freelancer
0.05% → PayTrust Protocol Treasury
```

---

## 3. Protocol Fee Model

PayTrust charges a **0.05% protocol fee** on every successfully released milestone payment. Fees accumulate in the protocol treasury and can be withdrawn by the protocol owner.

### Basis Points (BPS) Precision:
```solidity
uint256 public constant FEE_BPS = 5;         // 0.05% (5 basis points)
uint256 public constant BPS_DENOMINATOR = 10000;

uint256 fee = (milestoneAmount * FEE_BPS) / BPS_DENOMINATOR;
uint256 freelancerPayment = milestoneAmount - fee;
```

### Payout Examples:
| Milestone Amount | Freelancer Receives (99.95%) | PayTrust Treasury (0.05%) |
| :--- | :--- | :--- |
| **0.10 ETH** | 0.09995 ETH | 0.00005 ETH |
| **1.00 ETH** | 0.99950 ETH | 0.00050 ETH |
| **5.00 ETH** | 4.99750 ETH | 0.00250 ETH |
| **10.00 ETH** | 9.99500 ETH | 0.00500 ETH |

---

## 4. System Architecture

```text
+-------------------------------------------------------------+
|                      React + Vite Frontend                  |
|  (Tailwind CSS, Ethers.js, Lucide Icons, MetaMask Provider) |
+-------------------------------------------------------------+
                               │
                        EIP-1193 / RPC
                               ▼
+-------------------------------------------------------------+
|                   Arbitrum Sepolia Testnet                  |
|            (Chain ID: 421614 / Gas-Optimized L2)            |
+-------------------------------------------------------------+
                               │
                               ▼
+-------------------------------------------------------------+
|                   PayTrust.sol Smart Contract               |
|      - OpenZeppelin ReentrancyGuard & Ownable               |
|      - Project & Milestone Struct Accounting                |
|      - Checks-Effects-Interactions (CEI) Security           |
+-------------------------------------------------------------+
             │                                    │
     (99.95% Payout)                        (0.05% Fee)
             ▼                                    ▼
+-------------------------+          +-------------------------+
|   Freelancer Wallet     |          | Protocol Treasury       |
+-------------------------+          +-------------------------+
```

---

## 5. Smart Contract Core Functions (`PayTrust.sol`)

- `createProject(string name, address freelancer, string[] descriptions, uint256[] amounts)`: Client initiates project with specified deliverables and ETH values.
- `fundProject(uint256 projectId) payable`: Client deposits exact total project ETH into the escrow contract.
- `submitMilestone(uint256 projectId, uint256 milestoneIndex)`: Freelancer marks a specific milestone deliverable as completed on-chain.
- `approveMilestone(uint256 projectId, uint256 milestoneIndex)`: Client approves completed deliverable, triggering automatic 99.95% transfer to freelancer and 0.05% treasury fee deduction.
- `cancelProject(uint256 projectId)`: Client cancels active/created project and safely receives full refund of any remaining unreleased escrow funds.
- `withdrawProtocolFees(address payable recipient)`: Protocol owner withdraws accumulated treasury fees.
- `getProject(uint256 projectId)` & `getProtocolStats()`: Real-time project inspection and macro protocol metrics.

---

## 6. Tech Stack

- **Smart Contracts:** Solidity `0.8.24`, OpenZeppelin Contracts `v5.6` (`Ownable`, `ReentrancyGuard`)
- **Development & Testing:** Hardhat, Ethers.js `v6`, Chai
- **Network:** Arbitrum Sepolia Testnet (`Chain ID: 421614`)
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Wallet Connection:** MetaMask (EIP-1193) with automatic Arbitrum Sepolia network detection and switching

---

## 7. Installation & Local Development

### Prerequisites:
- Node.js `v18+` (tested on Node `v20+` & `v26+`)
- npm `v9+`
- MetaMask browser extension

### Step 1: Clone and Install Root Dependencies
```bash
git clone https://github.com/mandeep-singh21/Soleth.git PayTrust
cd PayTrust
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 8. Running Automated Tests

Run the complete automated Hardhat test suite covering all 14 mandatory functional specifications and edge cases (31 passing assertions):

```bash
npm test
```

### Test Coverage Highlights:
- [x] Project creation with validation (empty name, zero address, client-as-freelancer, mismatched arrays)
- [x] Exact funding lock and under/over-funding rejection
- [x] Freelancer milestone submission & unauthorized wallet rejection
- [x] Client approval and unsubmitted milestone approval rejection
- [x] Precise 0.05% fee deduction & 99.95% payout verification down to the wei
- [x] Treasury accumulation across multiple projects without escrow contamination
- [x] Exclusive owner fee withdrawal & empty treasury protection
- [x] Double-submission and double-payment prevention
- [x] Safe project cancellation and remaining balance refund

---

## 9. Deployment Instructions

### Local Mock / Testing Deployment:
```bash
# Compile contracts
npm run compile

# Seed demo data on local node
npm run seed

# Start frontend application
npm run dev
```

### Deploying to Arbitrum Sepolia Testnet:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your deployer private key and Arbitrum Sepolia RPC:
   ```env
   PRIVATE_KEY=your_private_key_here
   ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
   ```
3. Run the deployment script:
   ```bash
   npm run deploy:sepolia
   ```
4. The deployment script automatically exports the contract address and ABI to `frontend/src/contracts/contractConfig.json`.

---

## 10. Contract Address Information

- **Network:** Arbitrum Sepolia
- **Chain ID:** `421614` (`0x66eee`)
- **Explorer:** [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io)
- **Deployed Contract Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3` *(Local / Seeded deployment configuration included)*

---

## 11. Quick Demo Walkthrough Script

1. **Connect Wallet:** Click **"Connect Wallet"** in the navigation bar using MetaMask.
2. **Switch Network:** If prompted, switch network to **Arbitrum Sepolia Testnet**.
3. **Create Project:** Click **"+ New Project"**, enter a project title, paste the freelancer's wallet address, and configure 3 milestone phases with ETH amounts.
4. **Lock Escrow:** Open the project modal as the Client and click **"Fund Escrow (X.X ETH)"**.
5. **Submit Milestone Work:** Switch to the Freelancer wallet in MetaMask and click **"Submit Work"** on Milestone 1.
6. **Approve Milestone:** Switch back to the Client wallet and click **"Approve & Release Payment"**.
7. **Verify Balances:**
   - Freelancer receives **99.95%** of the milestone value.
   - PayTrust Protocol Treasury accumulates the **0.05% fee**.
   - Milestone status updates from `Pending` → `Submitted` → `Paid`.

---

## 12. Presentation Deck

An interactive presentation deck is included in the project:
- **Markdown Deck:** [`PRESENTATION.md`](./PRESENTATION.md)
- **Interactive HTML Presentation:** Open [`presentation.html`](./presentation.html) in any browser to present the 10-slide pitch deck with keyboard navigation (`←` / `→`).



--Made by: Mandeep Singh
--Vercel Link: [https://frontend-eight-sepia-21.vercel.app/](https://frontend-eight-sepia-21.vercel.app/) 

