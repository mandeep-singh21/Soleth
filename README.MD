# PayTrust

> **Secure payments. Trustless milestones.**

PayTrust is a decentralized, milestone-based escrow protocol built on **Arbitrum Sepolia** that solves the fundamental trust dilemma between clients and freelancers through smart contract-enforced payments and automated **0.05% protocol fee** accounting.

The platform features a **Google Pay-inspired modern UI**, built-in **1-click demo personas & private key entry** for fast hackathon judging, custom **Arbitrum Sepolia RPC endpoint configuration with live ping testing**, and **Arbiscan API key integration**.

- **Author**: Mandeep Singh
- **Live Vercel Deployment:** [https://frontend-eight-sepia-21.vercel.app/](https://frontend-eight-sepia-21.vercel.app/)

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

## 4. Google Pay-Inspired Interactive Interface

The frontend is styled with a sleek **Google Pay theme**:
- **Google Brand Palette:** Google Blue (`#1a73e8` / `#4285F4`), Google Green (`#34A853`), Google Yellow (`#FBBC04`), Google Red (`#EA4335`), and dark surface cards (`#141822`).
- **Interactive Fee Calculator Widget:** Real-time dual-card breakdown where users can type or slide ETH values to inspect the exact 99.95% vs 0.05% split with visual proportional bars and USD conversion estimates.
- **1-Click Demo Personas & Private Key Entry:**
  - **Alice (Client Demo):** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - **Bob (Freelancer Demo):** `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - **Protocol Owner Demo:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - **Custom Key:** Enter any 64-char Arbitrum Sepolia hex private key directly in browser session memory to sign without browser extension popups!
- **Custom Arbitrum Sepolia RPC Endpoint:** Configurable RPC URL with live connection test, block height sync, and latency ping (`ms`).
- **Arbiscan Sepolia API Key Integration:** Save custom Arbiscan keys for transaction queries and verified explorer inspection.

---

## 5. System Architecture

```text
+-------------------------------------------------------------+
|              React 18 + Vite + Google Pay Theme             |
|   (Material You Pills, Ethers.js, MetaMask & Private Key)   |
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

## 6. Smart Contract Core Functions (`PayTrust.sol`)

- `createProject(string name, address freelancer, string[] descriptions, uint256[] amounts)`: Client initiates project with specified deliverables and ETH values.
- `fundProject(uint256 projectId) payable`: Client deposits exact total project ETH into the escrow contract.
- `submitMilestone(uint256 projectId, uint256 milestoneIndex)`: Freelancer marks a specific milestone deliverable as completed on-chain.
- `approveMilestone(uint256 projectId, uint256 milestoneIndex)`: Client approves completed deliverable, triggering automatic 99.95% transfer to freelancer and 0.05% treasury fee deduction.
- `cancelProject(uint256 projectId)`: Client cancels active/created project and safely receives full refund of any remaining unreleased escrow funds.
- `withdrawProtocolFees(address payable recipient)`: Protocol owner withdraws accumulated treasury fees.
- `getProject(uint256 projectId)` & `getProtocolStats()`: Real-time project inspection and macro protocol metrics.

---

## 7. Running Automated Tests

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

## 8. Installation & Local Development

```bash
# 1. Install dependencies
npm install
npm --prefix frontend install

# 2. Compile contracts
npm run compile

# 3. Run automated tests
npm test

# 4. Start frontend with Google Pay theme
npm run dev
```

---

## 9. Contract Address & Network Information

- **Network:** Arbitrum Sepolia
- **Chain ID:** `421614` (`0x66eee`)
- **Explorer:** [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io)
- **Deployed Contract Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## 10. Quick Demo Walkthrough Script

1. **Connect Wallet or Pick Demo Persona:** Click **"Connect Wallet"** with MetaMask or click any of the **1-Click Demo Personas** (`Alice Client`, `Bob Freelancer`, `Owner`).
2. **Switch Network:** If prompted, switch network to **Arbitrum Sepolia Testnet**.
3. **Create Project:** Click **"+ New Project"**, enter a project title, paste the freelancer's wallet address, and configure 3 milestone phases with ETH amounts.
4. **Lock Escrow:** Open the project modal as the Client and click **"Fund Escrow (X.X ETH)"**.
5. **Submit Milestone Work:** Switch to the Freelancer wallet and click **"Submit Work"** on Milestone 1.
6. **Approve Milestone:** Switch back to the Client wallet and click **"Approve & Release Payment"**.
7. **Verify Balances:**
   - Freelancer receives **99.95%** of the milestone value.
   - PayTrust Protocol Treasury accumulates the **0.05% fee**.
   - Milestone status updates from `Pending` → `Submitted` → `Paid`.

---

## 11. Presentation Deck

An interactive presentation deck is included in the project:
- **Markdown Deck:** [`PRESENTATION.md`](./PRESENTATION.md)
- **Interactive HTML Presentation:** Open [`presentation.html`](./presentation.html) in any browser to present the 10-slide pitch deck with keyboard navigation (`←` / `→`).

---

## 12. Security Disclaimer

> **Hackathon Prototype Disclaimer:**
> This software is a hackathon prototype developed for educational and demonstration purposes. It has not been subjected to a formal security audit. Do not use this contract with real mainnet funds.