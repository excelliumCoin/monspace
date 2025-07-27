// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameRegistration {
    address public owner;
    address public paymentAddress;
    uint256 public constant REGISTRATION_FEE = 0.25 ether; // 0.25 Monad

    // Mapping to store unique username for each address
    mapping(address => string) public usernames;
    mapping(string => bool) public usernameExists;
    
    // Array to store all registered players
    address[] public registeredPlayers;

    // Event for successful registration
    event Registered(address indexed user, string username, uint256 timestamp);
    event GameStarted(address indexed player, string username);

    constructor(address _paymentAddress) {
        owner = msg.sender;
        paymentAddress = _paymentAddress;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Register a unique username by paying exactly REGISTRATION_FEE
    function register(string calldata username) external payable {
        require(msg.value == REGISTRATION_FEE, "Must pay exactly 0.25 Monad");
        require(bytes(usernames[msg.sender]).length == 0, "User already registered");
        require(!usernameExists[username], "Username already taken");
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 20, "Username too long");

        // Transfer payment to designated address
        payable(paymentAddress).transfer(msg.value);

        // Store username
        usernames[msg.sender] = username;
        usernameExists[username] = true;
        registeredPlayers.push(msg.sender);

        emit Registered(msg.sender, username, block.timestamp);
    }

    // Start game (can be called by registered players)
    function startGame() external {
        require(bytes(usernames[msg.sender]).length > 0, "Must be registered to start game");
        emit GameStarted(msg.sender, usernames[msg.sender]);
    }

    // Get username for an address
    function getUsername(address player) external view returns (string memory) {
        return usernames[player];
    }

    // Get total registered players count
    function getRegisteredPlayersCount() external view returns (uint256) {
        return registeredPlayers.length;
    }

    // Get all registered players
    function getAllRegisteredPlayers() external view returns (address[] memory) {
        return registeredPlayers;
    }

    // Check if username is available
    function isUsernameAvailable(string calldata username) external view returns (bool) {
        return !usernameExists[username];
    }

    // Emergency withdraw function (only owner)
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Fallback function to reject direct payments
    receive() external payable {
        revert("Direct payments not allowed. Use register() function.");
    }
}
