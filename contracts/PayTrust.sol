// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayTrust
 * @author PayTrust Protocol
 * @notice Decentralized, milestone-based escrow platform for freelancers and clients.
 * @dev Secure payments with 0.05% protocol fee deducted on milestone release into treasury.
 */
contract PayTrust is Ownable, ReentrancyGuard {
    // --- Constants ---
    uint256 public constant FEE_BPS = 5; // 0.05% fee (5 basis points)
    uint256 public constant BPS_DENOMINATOR = 10000;

    // --- Enums ---
    enum ProjectStatus {
        Created,
        Funded,
        Completed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        Submitted,
        Paid
    }

    // --- Structs ---
    struct Milestone {
        string description;
        uint256 amount;
        MilestoneStatus status;
        uint256 submissionTime;
        uint256 paidTime;
    }

    struct Project {
        uint256 id;
        string name;
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 paidAmount;
        uint256 refundedAmount;
        bool isFunded;
        ProjectStatus status;
        uint256 createdAt;
        uint256 milestoneCount;
    }

    // --- Storage ---
    uint256 private _projectCounter;
    uint256 public protocolTreasuryBalance;
    uint256 public totalProtocolFeesCollected;
    uint256 public totalEscrowVolume;

    // Project ID => Project
    mapping(uint256 => Project) public projects;
    // Project ID => Milestones array
    mapping(uint256 => Milestone[]) private _projectMilestones;

    // User address => Project IDs list where user is client
    mapping(address => uint256[]) private _clientProjects;
    // User address => Project IDs list where user is freelancer
    mapping(address => uint256[]) private _freelancerProjects;

    // List of all project IDs
    uint256[] private _allProjectIds;

    // --- Events ---
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        address indexed client,
        address indexed freelancer,
        uint256 totalAmount,
        uint256 milestoneCount
    );

    event ProjectFunded(
        uint256 indexed projectId,
        address indexed client,
        uint256 amount
    );

    event MilestoneSubmitted(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed freelancer,
        uint256 timestamp
    );

    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed client,
        uint256 timestamp
    );

    event MilestonePaid(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed freelancer,
        uint256 freelancerPayment,
        uint256 protocolFee
    );

    event ProjectCompleted(
        uint256 indexed projectId,
        uint256 totalPaid
    );

    event ProjectCancelled(
        uint256 indexed projectId,
        address indexed client,
        uint256 refundedAmount
    );

    event ProtocolFeesWithdrawn(
        address indexed recipient,
        uint256 amount
    );

    // --- Constructor ---
    constructor() Ownable(msg.sender) {}

    // --- External Functions ---

    /**
     * @notice Create a new milestone project between client and freelancer.
     * @param name Project title / name
     * @param freelancer Freelancer wallet address
     * @param descriptions Array of milestone descriptions
     * @param amounts Array of milestone payment amounts in wei
     * @return projectId The unique identifier of the created project
     */
    function createProject(
        string calldata name,
        address freelancer,
        string[] calldata descriptions,
        uint256[] calldata amounts
    ) external returns (uint256 projectId) {
        require(bytes(name).length > 0, "Project name cannot be empty");
        require(freelancer != address(0), "Invalid freelancer address");
        require(freelancer != msg.sender, "Client cannot be freelancer");
        require(descriptions.length > 0, "At least one milestone required");
        require(
            descriptions.length == amounts.length,
            "Mismatched descriptions and amounts"
        );

        _projectCounter++;
        projectId = _projectCounter;

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Milestone amount must be greater than zero");
            require(
                bytes(descriptions[i]).length > 0,
                "Milestone description cannot be empty"
            );
            total += amounts[i];

            _projectMilestones[projectId].push(
                Milestone({
                    description: descriptions[i],
                    amount: amounts[i],
                    status: MilestoneStatus.Pending,
                    submissionTime: 0,
                    paidTime: 0
                })
            );
        }

        projects[projectId] = Project({
            id: projectId,
            name: name,
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: total,
            paidAmount: 0,
            refundedAmount: 0,
            isFunded: false,
            status: ProjectStatus.Created,
            createdAt: block.timestamp,
            milestoneCount: descriptions.length
        });

        _clientProjects[msg.sender].push(projectId);
        _freelancerProjects[freelancer].push(projectId);
        _allProjectIds.push(projectId);

        emit ProjectCreated(
            projectId,
            name,
            msg.sender,
            freelancer,
            total,
            descriptions.length
        );
    }

    /**
     * @notice Client deposits the total project ETH amount into escrow.
     * @param projectId The project ID to fund
     */
    function fundProject(uint256 projectId) external payable nonReentrant {
        Project storage project = projects[projectId];
        require(project.id != 0, "Project does not exist");
        require(msg.sender == project.client, "Only client can fund project");
        require(!project.isFunded, "Project already funded");
        require(
            project.status == ProjectStatus.Created,
            "Project not in Created status"
        );
        require(
            msg.value == project.totalAmount,
            "Funding amount must exactly match total project amount"
        );

        project.isFunded = true;
        project.status = ProjectStatus.Funded;
        totalEscrowVolume += msg.value;

        emit ProjectFunded(projectId, msg.sender, msg.value);
    }

    /**
     * @notice Freelancer submits a completed milestone for client review.
     * @param projectId The project ID
     * @param milestoneIndex Index of the milestone (0-based)
     */
    function submitMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external nonReentrant {
        Project storage project = projects[projectId];
        require(project.id != 0, "Project does not exist");
        require(
            msg.sender == project.freelancer,
            "Only freelancer can submit milestone"
        );
        require(project.isFunded, "Project is not funded");
        require(
            project.status == ProjectStatus.Funded,
            "Project is not active"
        );
        require(
            milestoneIndex < _projectMilestones[projectId].length,
            "Invalid milestone index"
        );

        Milestone storage milestone = _projectMilestones[projectId][milestoneIndex];
        require(
            milestone.status == MilestoneStatus.Pending,
            "Milestone is not pending"
        );

        milestone.status = MilestoneStatus.Submitted;
        milestone.submissionTime = block.timestamp;

        emit MilestoneSubmitted(projectId, milestoneIndex, msg.sender, block.timestamp);
    }

    /**
     * @notice Client approves submitted milestone and triggers automatic payment.
     * @dev Deducts 0.05% protocol fee to treasury and sends 99.95% to freelancer.
     * @param projectId The project ID
     * @param milestoneIndex Index of the milestone (0-based)
     */
    function approveMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external nonReentrant {
        Project storage project = projects[projectId];
        require(project.id != 0, "Project does not exist");
        require(
            msg.sender == project.client,
            "Only client can approve milestone"
        );
        require(project.isFunded, "Project is not funded");
        require(
            project.status == ProjectStatus.Funded,
            "Project is not active"
        );
        require(
            milestoneIndex < _projectMilestones[projectId].length,
            "Invalid milestone index"
        );

        Milestone storage milestone = _projectMilestones[projectId][milestoneIndex];
        require(
            milestone.status == MilestoneStatus.Submitted,
            "Milestone must be submitted before approval"
        );

        // Calculate 0.05% fee and freelancer payout
        uint256 fee = (milestone.amount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 freelancerPayment = milestone.amount - fee;

        // Effects
        milestone.status = MilestoneStatus.Paid;
        milestone.paidTime = block.timestamp;
        project.paidAmount += milestone.amount;

        protocolTreasuryBalance += fee;
        totalProtocolFeesCollected += fee;

        emit MilestoneApproved(projectId, milestoneIndex, msg.sender, block.timestamp);
        emit MilestonePaid(
            projectId,
            milestoneIndex,
            project.freelancer,
            freelancerPayment,
            fee
        );

        // Check if all milestones are paid
        if (project.paidAmount == project.totalAmount) {
            project.status = ProjectStatus.Completed;
            emit ProjectCompleted(projectId, project.paidAmount);
        }

        // Interactions (transfer to freelancer)
        (bool success, ) = payable(project.freelancer).call{
            value: freelancerPayment
        }("");
        require(success, "Freelancer payment transfer failed");
    }

    /**
     * @notice Client cancels the project and refunds any remaining unreleased escrow funds.
     * @param projectId The project ID to cancel
     */
    function cancelProject(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];
        require(project.id != 0, "Project does not exist");
        require(
            msg.sender == project.client,
            "Only client can cancel project"
        );
        require(
            project.status == ProjectStatus.Created ||
                project.status == ProjectStatus.Funded,
            "Project cannot be cancelled in current status"
        );

        uint256 refundAmount = 0;

        if (project.isFunded) {
            uint256 remainingEscrow = project.totalAmount -
                project.paidAmount -
                project.refundedAmount;
            require(remainingEscrow > 0, "No remaining funds to refund");

            refundAmount = remainingEscrow;
            project.refundedAmount += remainingEscrow;
        }

        project.status = ProjectStatus.Cancelled;

        emit ProjectCancelled(projectId, msg.sender, refundAmount);

        if (refundAmount > 0) {
            (bool success, ) = payable(project.client).call{
                value: refundAmount
            }("");
            require(success, "Refund transfer failed");
        }
    }

    /**
     * @notice Protocol Owner withdraws accumulated protocol fees to a designated recipient address.
     * @param recipient The destination wallet address for withdrawn fees
     */
    function withdrawProtocolFees(
        address payable recipient
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        uint256 amount = protocolTreasuryBalance;
        require(amount > 0, "No protocol fees available to withdraw");

        // Effects
        protocolTreasuryBalance = 0;

        emit ProtocolFeesWithdrawn(recipient, amount);

        // Interactions
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Protocol fee withdrawal transfer failed");
    }

    // --- View Functions ---

    /**
     * @notice Fetch project data along with all its milestones.
     * @param projectId The project ID
     * @return project The project struct
     * @return milestones Array of milestones
     */
    function getProject(
        uint256 projectId
    )
        external
        view
        returns (Project memory project, Milestone[] memory milestones)
    {
        project = projects[projectId];
        milestones = _projectMilestones[projectId];
    }

    /**
     * @notice Fetch all milestones for a project.
     * @param projectId The project ID
     * @return Array of milestones
     */
    function getProjectMilestones(
        uint256 projectId
    ) external view returns (Milestone[] memory) {
        return _projectMilestones[projectId];
    }

    /**
     * @notice Fetch all project IDs where user is the client.
     */
    function getUserClientProjects(
        address user
    ) external view returns (uint256[] memory) {
        return _clientProjects[user];
    }

    /**
     * @notice Fetch all project IDs where user is the freelancer.
     */
    function getUserFreelancerProjects(
        address user
    ) external view returns (uint256[] memory) {
        return _freelancerProjects[user];
    }

    /**
     * @notice Fetch all created project IDs.
     */
    function getAllProjects() external view returns (uint256[] memory) {
        return _allProjectIds;
    }

    /**
     * @notice Get protocol-wide statistics.
     */
    function getProtocolStats()
        external
        view
        returns (
            uint256 totalProjects,
            uint256 totalVolume,
            uint256 accumulatedFees,
            uint256 currentTreasuryBalance
        )
    {
        return (
            _projectCounter,
            totalEscrowVolume,
            totalProtocolFeesCollected,
            protocolTreasuryBalance
        );
    }
}