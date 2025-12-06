import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import {
  getProvider,
  getWallet,
  getContract,
  SRGG_MARKETPLACE_ABI,
  uploadToIPFS,
  getFromIPFS,
} from '@/lib/blockchain';
import type { TokenMetadata, TokenizeRequest } from '@/types';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    if (process.env.ENABLE_BLOCKCHAIN === 'true') {
      this.provider = getProvider();
      this.wallet = getWallet();
    }
  }

  // ============================================================================
  // Token Minting & Management
  // ============================================================================

  async mintToken(data: TokenizeRequest) {
    const { listingId, tokenType, metadata } = data;

    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        producer: true,
        commodity: true,
      },
    });

    if (!listing) throw new Error('Listing not found');

    // Prepare token metadata
    const tokenMetadata: TokenMetadata = {
      name: listing.title,
      description: listing.description || '',
      image: listing.images[0] || '',
      attributes: [
        { trait_type: 'Commodity', value: listing.commodity.name },
        { trait_type: 'Quantity', value: listing.quantity },
        { trait_type: 'Unit', value: listing.unit },
        { trait_type: 'Quality Grade', value: listing.qualityGrade || 'N/A' },
        { trait_type: 'Producer', value: listing.producer.name },
        { trait_type: 'SRGG EID', value: listing.producer.srggEid },
        { trait_type: 'Origin', value: listing.location?.address || 'N/A' },
      ],
      properties: {
        listingId: listing.id,
        producerId: listing.producerId,
        harvestDate: listing.harvestDate,
        ...metadata,
      },
    };

    // Upload metadata to IPFS
    const ipfsHash = await uploadToIPFS(tokenMetadata);

    // Create token record (initially pending)
    const token = await prisma.token.create({
      data: {
        listingId,
        tokenType: tokenType === 'NFT' ? 'NON_FUNGIBLE' : 'FUNGIBLE',
        blockchain: process.env.BLOCKCHAIN_NETWORK || 'polygon',
        ipfsHash,
        metadata: tokenMetadata,
        owner: listing.producer.user.email, // Temporary, will be updated with wallet address
        status: 'PENDING',
      },
    });

    // If blockchain is enabled, mint on-chain
    if (process.env.ENABLE_BLOCKCHAIN === 'true') {
      try {
        const txHash = await this.mintOnChain(token.id, ipfsHash);
        await prisma.token.update({
          where: { id: token.id },
          data: {
            txHash,
            status: 'MINTING',
          },
        });
      } catch (error) {
        console.error('Blockchain minting failed:', error);
        // Keep token in pending state for retry
      }
    } else {
      // For development, simulate minting
      await prisma.token.update({
        where: { id: token.id },
        data: {
          tokenAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
          tokenId: Math.floor(Math.random() * 1000000).toString(),
          status: 'ACTIVE',
          mintedAt: new Date(),
          mintedBy: listing.producerId,
        },
      });
    }

    return token;
  }

  private async mintOnChain(tokenId: string, ipfsHash: string): Promise<string> {
    const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error('Contract address not configured');

    const contract = getContract(contractAddress, SRGG_MARKETPLACE_ABI);
    const tokenURI = `ipfs://${ipfsHash}`;

    // Convert tokenId to bytes32
    const listingIdBytes32 = ethers.id(tokenId).slice(0, 66);

    const tx = await contract.createToken(tokenURI, listingIdBytes32);
    return tx.hash;
  }

  async verifyTokenOnChain(tokenId: string) {
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) throw new Error('Token not found');

    if (process.env.ENABLE_BLOCKCHAIN !== 'true') {
      // Simulate verification
      return await prisma.token.update({
        where: { id: tokenId },
        data: { status: 'ACTIVE' },
      });
    }

    const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error('Contract address not configured');

    const contract = getContract(contractAddress, SRGG_MARKETPLACE_ABI);
    const isVerified = await contract.verifyToken(token.tokenId);

    if (isVerified) {
      return await prisma.token.update({
        where: { id: tokenId },
        data: { status: 'ACTIVE' },
      });
    }

    throw new Error('Token verification failed');
  }

  async transferToken(tokenId: string, toAddress: string) {
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) throw new Error('Token not found');

    if (process.env.ENABLE_BLOCKCHAIN === 'true') {
      const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('Contract address not configured');

      const contract = getContract(contractAddress, SRGG_MARKETPLACE_ABI);
      const tx = await contract.transferToken(token.tokenId, toAddress);
      await tx.wait();
    }

    // Update owner in database
    return await prisma.token.update({
      where: { id: tokenId },
      data: {
        owner: toAddress,
        status: 'TRANSFERRED',
      },
    });
  }

  async anchorProof(tokenId: string, certificateHash: string) {
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) throw new Error('Token not found');

    if (process.env.ENABLE_BLOCKCHAIN === 'true') {
      const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('Contract address not configured');

      const contract = getContract(contractAddress, SRGG_MARKETPLACE_ABI);
      const tx = await contract.anchorProof(token.tokenId, certificateHash);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
      };
    }

    // Simulate anchoring for development
    return {
      txHash: `0x${Math.random().toString(16).slice(2)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
    };
  }

  // ============================================================================
  // Blockchain Query Functions
  // ============================================================================

  async getTokenMetadata(tokenId: string) {
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) throw new Error('Token not found');

    if (token.ipfsHash) {
      return await getFromIPFS(token.ipfsHash);
    }

    return token.metadata;
  }

  async getTokenHistory(tokenId: string) {
    // Query blockchain events for this token
    // This would integrate with The Graph or similar indexing service
    return [
      {
        event: 'TokenCreated',
        timestamp: new Date(),
        from: '0x0000000000000000000000000000000000000000',
        to: 'producer_address',
      },
    ];
  }

  async getWalletBalance(address: string) {
    if (process.env.ENABLE_BLOCKCHAIN !== 'true') {
      return { balance: '0', tokens: [] };
    }

    const balance = await this.provider.getBalance(address);
    const tokens = await prisma.token.findMany({
      where: { owner: address },
      include: {
        listing: {
          include: {
            commodity: true,
          },
        },
      },
    });

    return {
      balance: ethers.formatEther(balance),
      tokens,
    };
  }

  // ============================================================================
  // Smart Contract Interactions
  // ============================================================================

  async deployContract(abi: any[], bytecode: string, ...args: any[]) {
    if (process.env.ENABLE_BLOCKCHAIN !== 'true') {
      throw new Error('Blockchain is disabled');
    }

    const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();

    return {
      address: await contract.getAddress(),
      txHash: contract.deploymentTransaction()?.hash,
    };
  }

  async callContractMethod(
    contractAddress: string,
    abi: any[],
    methodName: string,
    ...args: any[]
  ) {
    const contract = getContract(contractAddress, abi);
    const result = await contract[methodName](...args);
    return result;
  }

  async sendTransaction(to: string, value: string, data?: string) {
    if (process.env.ENABLE_BLOCKCHAIN !== 'true') {
      throw new Error('Blockchain is disabled');
    }

    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.parseEther(value),
      data: data || '0x',
    });

    return await tx.wait();
  }
}

export const blockchainService = new BlockchainService();
