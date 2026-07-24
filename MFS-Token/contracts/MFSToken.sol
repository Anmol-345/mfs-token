// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MFSToken is ERC20, ERC20Pausable, Ownable {
    uint8 public constant DECIMALS = 8;

    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**8;
    uint256 public constant MAX_TRANSFER_FEE = 100_000_000;

    uint256 public transferFee;
    address public feeAddress;
    mapping(address => bool) public feeExempt;

    event TransferFeeCollected(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 fee
    );
    event FeeAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );
    event TransferFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeExemptStatusUpdated(
        address indexed account,
        bool status
    );

    constructor(
        address stakeholderWallet,
        address investorWallet,
        address stakingPoolWallet,
        address mainWallet,
        address _feeAddress
    ) ERC20("MFS Crypto", "MFS") Ownable(msg.sender) {
        require(
            stakeholderWallet != address(0) &&
                investorWallet != address(0) &&
                stakingPoolWallet != address(0) &&
                mainWallet != address(0) &&
                _feeAddress != address(0),
            "MFSToken: zero address"
        );

        transferFee = 3_000_000;
        feeAddress = _feeAddress;

        _mint(address(this), TOTAL_SUPPLY);

        uint256 stackAmount = 100_000_000 * 10**8;
        _transfer(address(this), stakeholderWallet, stackAmount);
        _transfer(address(this), investorWallet, stackAmount);
        _transfer(address(this), stakingPoolWallet, stackAmount);
        _transfer(address(this), mainWallet, TOTAL_SUPPLY - (stackAmount * 3));
    }

    function setFeeAddress(address _newFeeAddress) external onlyOwner {
        require(_newFeeAddress != address(0), "MFSToken: zero address");
        emit FeeAddressUpdated(feeAddress, _newFeeAddress);
        feeAddress = _newFeeAddress;
    }

    function setTransferFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_TRANSFER_FEE, "MFSToken: fee exceeds max");
        emit TransferFeeUpdated(transferFee, _newFee);
        transferFee = _newFee;
    }

    function setFeeExempt(address _account, bool _status) external onlyOwner {
        feeExempt[_account] = _status;
        emit FeeExemptStatusUpdated(_account, _status);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        if (_shouldApplyFee(from, to)) {
            uint256 fee = _calculateFee(amount);
            if (fee > 0) {
                require(
                    balanceOf(from) >= amount,
                    "ERC20: transfer amount exceeds balance"
                );
                uint256 netAmount = amount - fee;
                super._update(from, to, netAmount);
                super._update(from, feeAddress, fee);
                emit TransferFeeCollected(from, to, amount, fee);
                return;
            }
        }
        super._update(from, to, amount);
    }

    function _shouldApplyFee(
        address from,
        address to
    ) internal view returns (bool) {
        if (from == address(0) || to == address(0)) return false;
        if (from == owner() || to == feeAddress) return false;
        if (from == address(this) || to == address(this) || from == feeAddress) return false;
        if (feeExempt[from] || feeExempt[to]) return false;
        return true;
    }

    function _calculateFee(uint256 amount) internal view returns (uint256) {
        if (amount < transferFee) return amount;
        return transferFee;
    }
}
