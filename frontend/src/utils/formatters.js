import { ethers } from 'ethers';

export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatEth(weiAmount, decimals = 4) {
  if (!weiAmount) return '0';
  try {
    const eth = ethers.formatEther(weiAmount);
    const num = parseFloat(eth);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  } catch (err) {
    return '0';
  }
}

export function calculateFeeAndPayout(amountEth) {
  const num = parseFloat(amountEth) || 0;
  const fee = (num * 5) / 10000; // 0.05%
  const payout = num - fee; // 99.95%
  return {
    fee: fee.toFixed(6).replace(/\.?0+$/, ''),
    payout: payout.toFixed(6).replace(/\.?0+$/, ''),
  };
}

export function formatDate(timestamp) {
  if (!timestamp || Number(timestamp) === 0) return 'N/A';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}