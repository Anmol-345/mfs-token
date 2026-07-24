// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MFSTimeLock is Ownable, ReentrancyGuard {
    IERC20 public token;
    address public beneficiary;
    uint256 public cliffEnd;
    uint256 public vestingEnd;
    uint256 public totalAmount;
    uint256 public released;

    event TokensReleased(
        address indexed beneficiary,
        uint256 amount
    );
    event TimeLockRevoked(
        address indexed owner,
        uint256 returnedAmount
    );

    constructor(
        address _token,
        address _beneficiary,
        uint256 _cliffDuration,
        uint256 _vestingDuration,
        uint256 _totalAmount
    ) Ownable(msg.sender) {
        require(_token != address(0), "MFSTimeLock: zero token");
        require(
            _beneficiary != address(0),
            "MFSTimeLock: zero beneficiary"
        );
        require(
            _vestingDuration > 0,
            "MFSTimeLock: zero vesting duration"
        );
        require(
            _totalAmount > 0,
            "MFSTimeLock: zero total amount"
        );

        token = IERC20(_token);
        beneficiary = _beneficiary;
        cliffEnd = block.timestamp + _cliffDuration;
        vestingEnd = cliffEnd + _vestingDuration;
        totalAmount = _totalAmount;
    }

    function releasableAmount() public view returns (uint256) {
        if (block.timestamp < cliffEnd) return 0;

        uint256 vested;
        if (block.timestamp >= vestingEnd) {
            vested = totalAmount;
        } else {
            vested = (totalAmount * (block.timestamp - cliffEnd)) /
                (vestingEnd - cliffEnd);
        }

        if (vested <= released) return 0;
        return vested - released;
    }

    function release() external nonReentrant {
        uint256 amount = releasableAmount();
        require(amount > 0, "MFSTimeLock: nothing to release");

        released += amount;
        require(
            token.transfer(beneficiary, amount),
            "MFSTimeLock: transfer failed"
        );

        emit TokensReleased(beneficiary, amount);
    }

    function revoke() external onlyOwner nonReentrant {
        uint256 remaining = totalAmount - released;
        require(remaining > 0, "MFSTimeLock: nothing to revoke");

        released = totalAmount;
        require(
            token.transfer(owner(), remaining),
            "MFSTimeLock: transfer failed"
        );

        emit TimeLockRevoked(owner(), remaining);
    }
}
