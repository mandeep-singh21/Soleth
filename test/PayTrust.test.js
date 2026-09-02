import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("PayTrust Smart Contract Test Suite", function () {
  let payTrust;
  let owner, client, freelancer, nonParticipant, treasuryRecipient;

  const ONE_ETH = ethers.parseEther("1.0");
  const TWO_ETH = ethers.parseEther("2.0");
  const HALF_ETH = ethers.parseEther("0.5");
  const TEN_ETH = ethers.parseEther("10.0");

  beforeEach(async function () {
    [owner, client, freelancer, nonParticipant, treasuryRecipient] =
      await ethers.getSigners();

    const PayTrustFactory = await ethers.getContractFactory("PayTrust");
    payTrust = await PayTrustFactory.deploy();
    await payTrust.waitForDeployment();
  });

  describe("1. Project Creation", function () {
    it("Should allow client to create a project with valid parameters and emit ProjectCreated event", async function () {
      const descriptions = ["Design UI/UX", "Develop Smart Contract", "Deploy Frontend"];
      const amounts = [ONE_ETH, TWO_ETH, HALF_ETH];
      const total = ONE_ETH + TWO_ETH + HALF_ETH;

      const tx = await payTrust
        .connect(client)
        .createProject("DApp Redesign", freelancer.address, descriptions, amounts);

      await expect(tx)
        .to.emit(payTrust, "ProjectCreated")
        .withArgs(1, "DApp Redesign", client.address, freelancer.address, total, 3);

      const [project, milestones] = await payTrust.getProject(1);
      expect(project.id).to.equal(1);
      expect(project.name).to.equal("DApp Redesign");
      expect(project.client).to.equal(client.address);
      expect(project.freelancer).to.equal(freelancer.address);
      expect(project.totalAmount).to.equal(total);
      expect(project.paidAmount).to.equal(0);
      expect(project.isFunded).to.be.false;
      expect(project.status).to.equal(0); // ProjectStatus.Created
      expect(project.milestoneCount).to.equal(3);

      expect(milestones.length).to.equal(3);
      expect(milestones[0].description).to.equal("Design UI/UX");
      expect(milestones[0].amount).to.equal(ONE_ETH);
      expect(milestones[0].status).to.equal(0); // MilestoneStatus.Pending

      // Check user project lists
      const clientProjects = await payTrust.getUserClientProjects(client.address);
      const freelancerProjects = await payTrust.getUserFreelancerProjects(freelancer.address);
      const allProjects = await payTrust.getAllProjects();

      expect(clientProjects.length).to.equal(1);
      expect(clientProjects[0]).to.equal(1);
      expect(freelancerProjects.length).to.equal(1);
      expect(freelancerProjects[0]).to.equal(1);
      expect(allProjects.length).to.equal(1);
      expect(allProjects[0]).to.equal(1);
    });
  });

  describe("2. Invalid Project Creation Validations", function () {
    it("Should revert if project name is empty", async function () {
      await expect(
        payTrust
          .connect(client)
          .createProject("", freelancer.address, ["Milestone 1"], [ONE_ETH])
      ).to.be.revertedWith("Project name cannot be empty");
    });

    it("Should revert if freelancer address is zero", async function () {
      await expect(
        payTrust
          .connect(client)
          .createProject("Proj", ethers.ZeroAddress, ["Milestone 1"], [ONE_ETH])
      ).to.be.revertedWith("Invalid freelancer address");
    });

    it("Should revert if client is the same as freelancer", async function () {
      await expect(
        payTrust
          .connect(client)
          .createProject("Self Freelance", client.address, ["Milestone 1"], [ONE_ETH])
      ).to.be.revertedWith("Client cannot be freelancer");
    });

    it("Should revert if milestone array is empty", async function () {
      await expect(
        payTrust.connect(client).createProject("Proj", freelancer.address, [], [])
      ).to.be.revertedWith("At least one milestone required");
    });

    it("Should revert if milestone descriptions and amounts length mismatch", async function () {
      await expect(
        payTrust
          .connect(client)
          .createProject("Proj", freelancer.address, ["M1", "M2"], [ONE_ETH])
      ).to.be.revertedWith("Mismatched descriptions and amounts");
    });

    it("Should revert if any milestone amount is zero", async function () {
      await expect(
        payTrust
          .connect(client)
          .createProject("Proj", freelancer.address, ["M1", "M2"], [ONE_ETH, 0])
      ).to.be.revertedWith("Milestone amount must be greater than zero");
    });

    it("Should revert if any milestone description is empty", async function () {
      await expect(
        payTrust
          .connect(client)
          .createProject("Proj", freelancer.address, ["", "M2"], [ONE_ETH, ONE_ETH])
      ).to.be.revertedWith("Milestone description cannot be empty");
    });
  });

  describe("3. Project Funding", function () {
    beforeEach(async function () {
      await payTrust
        .connect(client)
        .createProject(
          "Test Project",
          freelancer.address,
          ["M1", "M2"],
          [ONE_ETH, TWO_ETH]
        );
    });

    it("Should allow client to fund the exact project amount and update state", async function () {
      const total = ONE_ETH + TWO_ETH; // 3 ETH

      const tx = await payTrust.connect(client).fundProject(1, { value: total });

      await expect(tx)
        .to.emit(payTrust, "ProjectFunded")
        .withArgs(1, client.address, total);

      const [project] = await payTrust.getProject(1);
      expect(project.isFunded).to.be.true;
      expect(project.status).to.equal(1); // ProjectStatus.Funded

      // Contract balance should match
      const contractBalance = await ethers.provider.getBalance(
        await payTrust.getAddress()
      );
      expect(contractBalance).to.equal(total);

      // Protocol stats check
      const [, totalVolume] = await payTrust.getProtocolStats();
      expect(totalVolume).to.equal(total);
    });
  });

  describe("4. Funding Amount & Double Funding Rejection", function () {
    beforeEach(async function () {
      await payTrust
        .connect(client)
        .createProject(
          "Test Project",
          freelancer.address,
          ["M1", "M2"],
          [ONE_ETH, TWO_ETH]
        );
    });

    it("Should revert if funding with less than the total amount", async function () {
      await expect(
        payTrust.connect(client).fundProject(1, { value: ONE_ETH })
      ).to.be.revertedWith("Funding amount must exactly match total project amount");
    });

    it("Should revert if funding with more than the total amount", async function () {
      await expect(
        payTrust.connect(client).fundProject(1, { value: ethers.parseEther("4.0") })
      ).to.be.revertedWith("Funding amount must exactly match total project amount");
    });

    it("Should revert if non-client tries to fund", async function () {
      await expect(
        payTrust.connect(nonParticipant).fundProject(1, { value: ethers.parseEther("3.0") })
      ).to.be.revertedWith("Only client can fund project");
    });

    it("Should revert if client tries to fund twice", async function () {
      await payTrust.connect(client).fundProject(1, { value: ethers.parseEther("3.0") });

      await expect(
        payTrust.connect(client).fundProject(1, { value: ethers.parseEther("3.0") })
      ).to.be.revertedWith("Project already funded");
    });
  });

  describe("5 & 6. Milestone Submission & Unauthorized Access", function () {
    beforeEach(async function () {
      await payTrust
        .connect(client)
        .createProject("Escrow", freelancer.address, ["M1"], [ONE_ETH]);
    });

    it("Should revert if submitting before project is funded", async function () {
      await expect(
        payTrust.connect(freelancer).submitMilestone(1, 0)
      ).to.be.revertedWith("Project is not funded");
    });

    it("Should allow freelancer to submit milestone once funded", async function () {
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });

      const tx = await payTrust.connect(freelancer).submitMilestone(1, 0);
      await expect(tx).to.emit(payTrust, "MilestoneSubmitted");

      const [, milestones] = await payTrust.getProject(1);
      expect(milestones[0].status).to.equal(1); // MilestoneStatus.Submitted
      expect(milestones[0].submissionTime).to.be.gt(0);
    });

    it("Should revert if unauthorized wallet tries to submit milestone", async function () {
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });

      await expect(
        payTrust.connect(nonParticipant).submitMilestone(1, 0)
      ).to.be.revertedWith("Only freelancer can submit milestone");

      await expect(
        payTrust.connect(client).submitMilestone(1, 0)
      ).to.be.revertedWith("Only freelancer can submit milestone");
    });

    it("Should revert if submitting with invalid milestone index", async function () {
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });

      await expect(
        payTrust.connect(freelancer).submitMilestone(1, 99)
      ).to.be.revertedWith("Invalid milestone index");
    });
  });

  describe("7 & 8. Milestone Approval & Unauthorized Approval", function () {
    beforeEach(async function () {
      await payTrust
        .connect(client)
        .createProject("Escrow", freelancer.address, ["M1"], [ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });
    });

    it("Should revert if client approves before freelancer submits", async function () {
      await expect(
        payTrust.connect(client).approveMilestone(1, 0)
      ).to.be.revertedWith("Milestone must be submitted before approval");
    });

    it("Should revert if unauthorized account tries to approve milestone", async function () {
      await payTrust.connect(freelancer).submitMilestone(1, 0);

      await expect(
        payTrust.connect(freelancer).approveMilestone(1, 0)
      ).to.be.revertedWith("Only client can approve milestone");

      await expect(
        payTrust.connect(nonParticipant).approveMilestone(1, 0)
      ).to.be.revertedWith("Only client can approve milestone");
    });

    it("Should allow client to approve submitted milestone", async function () {
      await payTrust.connect(freelancer).submitMilestone(1, 0);

      const tx = await payTrust.connect(client).approveMilestone(1, 0);
      await expect(tx).to.emit(payTrust, "MilestoneApproved");

      const [project, milestones] = await payTrust.getProject(1);
      expect(milestones[0].status).to.equal(2); // MilestoneStatus.Paid
      expect(project.paidAmount).to.equal(ONE_ETH);
      expect(project.status).to.equal(2); // ProjectStatus.Completed
    });
  });

  describe("9 & 10. Payment Distribution & 0.05% Protocol Fee Calculation", function () {
    it("Should accurately distribute 99.95% to freelancer and 0.05% to protocol treasury for 1 ETH", async function () {
      // 1 ETH milestone
      await payTrust
        .connect(client)
        .createProject("1 ETH Proj", freelancer.address, ["M1"], [ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });
      await payTrust.connect(freelancer).submitMilestone(1, 0);

      const feeExpected = (ONE_ETH * 5n) / 10000n; // 0.0005 ETH = 500,000,000,000,000 wei
      const payoutExpected = ONE_ETH - feeExpected; // 0.9995 ETH = 999,500,000,000,000,000 wei

      expect(feeExpected).to.equal(ethers.parseEther("0.0005"));
      expect(payoutExpected).to.equal(ethers.parseEther("0.9995"));

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      const tx = await payTrust.connect(client).approveMilestone(1, 0);

      await expect(tx)
        .to.emit(payTrust, "MilestonePaid")
        .withArgs(1, 0, freelancer.address, payoutExpected, feeExpected);

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(payoutExpected);

      // Verify protocol treasury balance
      const treasuryBalance = await payTrust.protocolTreasuryBalance();
      expect(treasuryBalance).to.equal(feeExpected);
    });

    it("Should accurately calculate fee for 10 ETH (0.005 ETH fee, 9.995 ETH payout)", async function () {
      await payTrust
        .connect(client)
        .createProject("10 ETH Proj", freelancer.address, ["Big Milestone"], [TEN_ETH]);
      await payTrust.connect(client).fundProject(1, { value: TEN_ETH });
      await payTrust.connect(freelancer).submitMilestone(1, 0);

      const feeExpected = (TEN_ETH * 5n) / 10000n; // 0.005 ETH
      const payoutExpected = TEN_ETH - feeExpected; // 9.995 ETH

      expect(feeExpected).to.equal(ethers.parseEther("0.005"));
      expect(payoutExpected).to.equal(ethers.parseEther("9.995"));

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);
      await payTrust.connect(client).approveMilestone(1, 0);
      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(payoutExpected);
      expect(await payTrust.protocolTreasuryBalance()).to.equal(feeExpected);
    });
  });

  describe("11 & 12. Protocol Fees Accumulation & Owner Withdrawal", function () {
    it("Should accumulate protocol fees across multiple projects and milestones without mixing escrow funds", async function () {
      // Create Project 1 (1 ETH)
      await payTrust
        .connect(client)
        .createProject("Proj 1", freelancer.address, ["M1"], [ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });
      await payTrust.connect(freelancer).submitMilestone(1, 0);
      await payTrust.connect(client).approveMilestone(1, 0);

      // Create Project 2 (2 ETH)
      await payTrust
        .connect(client)
        .createProject("Proj 2", freelancer.address, ["M1"], [TWO_ETH]);
      await payTrust.connect(client).fundProject(2, { value: TWO_ETH });
      await payTrust.connect(freelancer).submitMilestone(2, 0);
      await payTrust.connect(client).approveMilestone(2, 0);

      const fee1 = (ONE_ETH * 5n) / 10000n; // 0.0005 ETH
      const fee2 = (TWO_ETH * 5n) / 10000n; // 0.0010 ETH
      const totalFees = fee1 + fee2; // 0.0015 ETH

      expect(await payTrust.protocolTreasuryBalance()).to.equal(totalFees);
      expect(await payTrust.totalProtocolFeesCollected()).to.equal(totalFees);
    });

    it("Should only allow the contract owner to withdraw accumulated protocol fees", async function () {
      await payTrust
        .connect(client)
        .createProject("Fee Test", freelancer.address, ["M1"], [ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });
      await payTrust.connect(freelancer).submitMilestone(1, 0);
      await payTrust.connect(client).approveMilestone(1, 0);

      const treasuryBalance = await payTrust.protocolTreasuryBalance();
      expect(treasuryBalance).to.be.gt(0);

      // Non-owner attempt should revert
      await expect(
        payTrust.connect(nonParticipant).withdrawProtocolFees(treasuryRecipient.address)
      ).to.be.revertedWithCustomError(payTrust, "OwnableUnauthorizedAccount");

      // Owner withdraws
      const recipientBalanceBefore = await ethers.provider.getBalance(
        treasuryRecipient.address
      );

      const tx = await payTrust
        .connect(owner)
        .withdrawProtocolFees(treasuryRecipient.address);

      await expect(tx)
        .to.emit(payTrust, "ProtocolFeesWithdrawn")
        .withArgs(treasuryRecipient.address, treasuryBalance);

      const recipientBalanceAfter = await ethers.provider.getBalance(
        treasuryRecipient.address
      );
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(treasuryBalance);

      // Treasury balance is now 0
      expect(await payTrust.protocolTreasuryBalance()).to.equal(0);

      // Re-withdrawing when 0 reverts
      await expect(
        payTrust.connect(owner).withdrawProtocolFees(treasuryRecipient.address)
      ).to.be.revertedWith("No protocol fees available to withdraw");
    });
  });

  describe("13. Prevention of Double Submission and Double Payment", function () {
    it("Should revert if freelancer tries to submit already submitted milestone", async function () {
      await payTrust
        .connect(client)
        .createProject("Double Spend Test", freelancer.address, ["M1", "M2"], [ONE_ETH, ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: TWO_ETH });
      await payTrust.connect(freelancer).submitMilestone(1, 0);

      await expect(
        payTrust.connect(freelancer).submitMilestone(1, 0)
      ).to.be.revertedWith("Milestone is not pending");
    });

    it("Should revert if client tries to approve already paid milestone while project is active", async function () {
      await payTrust
        .connect(client)
        .createProject("Double Spend Test 2", freelancer.address, ["M1", "M2"], [ONE_ETH, ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: TWO_ETH });
      await payTrust.connect(freelancer).submitMilestone(1, 0);
      await payTrust.connect(client).approveMilestone(1, 0);

      // Milestone 0 is paid, project still Funded because M2 remains
      await expect(
        payTrust.connect(client).approveMilestone(1, 0)
      ).to.be.revertedWith("Milestone must be submitted before approval");
    });
  });

  describe("14. Project Cancellation & Safe Refunds", function () {
    it("Should allow client to cancel an unfunded project", async function () {
      await payTrust
        .connect(client)
        .createProject("Unfunded Proj", freelancer.address, ["M1"], [ONE_ETH]);

      const tx = await payTrust.connect(client).cancelProject(1);
      await expect(tx)
        .to.emit(payTrust, "ProjectCancelled")
        .withArgs(1, client.address, 0);

      const [project] = await payTrust.getProject(1);
      expect(project.status).to.equal(3); // ProjectStatus.Cancelled
    });

    it("Should refund full locked escrow to client if cancelled before any milestone payment", async function () {
      await payTrust
        .connect(client)
        .createProject("Full Refund Proj", freelancer.address, ["M1"], [ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });

      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      const tx = await payTrust.connect(client).cancelProject(1);
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(payTrust, "ProjectCancelled")
        .withArgs(1, client.address, ONE_ETH);

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      expect(clientBalanceAfter).to.equal(clientBalanceBefore + ONE_ETH - gasSpent);

      const [project] = await payTrust.getProject(1);
      expect(project.status).to.equal(3); // ProjectStatus.Cancelled
      expect(project.refundedAmount).to.equal(ONE_ETH);
    });

    it("Should refund only unreleased escrow if cancelled after partial milestone payout", async function () {
      // 2 milestones of 1 ETH each = 2 ETH total
      await payTrust
        .connect(client)
        .createProject("Partial Refund Proj", freelancer.address, ["M1", "M2"], [ONE_ETH, ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: TWO_ETH });

      // Approve Milestone 0
      await payTrust.connect(freelancer).submitMilestone(1, 0);
      await payTrust.connect(client).approveMilestone(1, 0);

      // Now cancel project -> Remaining escrow is 1 ETH
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      const tx = await payTrust.connect(client).cancelProject(1);
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(payTrust, "ProjectCancelled")
        .withArgs(1, client.address, ONE_ETH);

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      expect(clientBalanceAfter).to.equal(clientBalanceBefore + ONE_ETH - gasSpent);

      const [project] = await payTrust.getProject(1);
      expect(project.status).to.equal(3); // ProjectStatus.Cancelled
      expect(project.paidAmount).to.equal(ONE_ETH);
      expect(project.refundedAmount).to.equal(ONE_ETH);

      // Re-cancelling reverts
      await expect(
        payTrust.connect(client).cancelProject(1)
      ).to.be.revertedWith("Project cannot be cancelled in current status");
    });

    it("Should revert if non-client tries to cancel project", async function () {
      await payTrust
        .connect(client)
        .createProject("Cancel Auth", freelancer.address, ["M1"], [ONE_ETH]);

      await expect(
        payTrust.connect(freelancer).cancelProject(1)
      ).to.be.revertedWith("Only client can cancel project");

      await expect(
        payTrust.connect(nonParticipant).cancelProject(1)
      ).to.be.revertedWith("Only client can cancel project");
    });

    it("Should prevent milestone submission and approval on cancelled projects", async function () {
      await payTrust
        .connect(client)
        .createProject("Cancelled Workflow", freelancer.address, ["M1"], [ONE_ETH]);
      await payTrust.connect(client).fundProject(1, { value: ONE_ETH });
      await payTrust.connect(client).cancelProject(1);

      await expect(
        payTrust.connect(freelancer).submitMilestone(1, 0)
      ).to.be.revertedWith("Project is not active");
    });
  });
});