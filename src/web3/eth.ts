import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { formatFixed } from '@ethersproject/bignumber'
import { Provider, BlockTag, CloudflareProvider, AlchemyProvider } from "@ethersproject/providers"
import { fetchJson } from '@ethersproject/web';
import {utils} from 'ethers';

import { AlchemyApiKey } from './env'
import * as data from './_data'

export const cloudflareProvider = new CloudflareProvider()
export const alchemyProvider = new AlchemyProvider('homestead', AlchemyApiKey)
export const defaultProvider = alchemyProvider;

export interface ProviderOptions {
  provider?: Provider
  test?: boolean
}

export interface GetBlockDataOptions extends ProviderOptions {
  blockTag?: BlockTag
}

export async function getBlockData({provider = defaultProvider, blockTag = 'latest', test}: GetBlockDataOptions = {}): Promise<BlockWithTransactions> {
  if (test) {
    return data.block;
  }

  const block = await provider.getBlockWithTransactions(blockTag)

  return block;
}

export interface GetLogsOptions extends ProviderOptions {
  fromBlock: BlockTag
  toBlock?: BlockTag
  address?: string
  topics?: string[]
}

export function getLogs({fromBlock, toBlock = 'latest', address, topics, provider = defaultProvider, test}: GetLogsOptions) {
  if (test) {
    return data.logs
  }

  return provider.getLogs({address, fromBlock, toBlock, topics})
}

export interface GetCodeOptions extends ProviderOptions {
  address: string
  blockTag?: BlockTag
}

export function getCode({address, blockTag, provider = defaultProvider}: GetCodeOptions) {
  return provider.getCode(address, blockTag)
}

export interface GetTokenMetadataResponse {
  decimals?: number | null
  logo?: string | null
  name?: string | null
  symbol?: string | null
}

export function getTokenMetadata(address: string): Promise<GetTokenMetadataResponse> {
  return alchemyProvider.send('alchemy_getTokenMetadata', [address])
}

export interface GetTokenBalanceResponse {
  address: string
  tokenBalances: {
    contractAddress: string
    tokenBalance: string | null,
    error: string | null,
  }[]
}

export async function getTokenBalances(address: string, contract: string) {
  const {tokenBalances: [{error, tokenBalance}]}: GetTokenBalanceResponse = await alchemyProvider.send('alchemy_getTokenBalances', [address, [contract]])

  if (error || !tokenBalance) {
    throw new Error(error || 'token balance missing')
  }

  return Number(formatFixed(tokenBalance))
}

export type TokenCategory = 'external' | 'internal' | 'token' | 'erc20' | 'erc721' | 'erc1155';

export interface GetAssetTransfersOptions {
  fromBlock?: BlockTag;
  toBlock?: BlockTag;
  fromAddress?: string;
  toAddress?: string;
  category?: TokenCategory[];
  excludeZeroValue?: boolean;
  maxCount?: number;
  pageKey?: string;
}

export interface TokenTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to?: string | null;
  value?: number | null;
  erc721TokenId?: string | null;
  erc1155Metadata?: string | null;
  tokenId?: string | null;
  asset?: string | null;
  category: TokenCategory;
  rawContract: {
    value?: string | null;
    address?: string | null;
    decimal?: string | null;
  }
}

export interface GetAssetTransfersResponse {
  transfers: TokenTransfer[];
  pageKey?: string | null;
}

export const defaultTokenCategories: TokenCategory[] = [
  // 'external',
  // 'internal',
  // 'token',
  'erc20',
  // 'erc721',
  // 'erc1155',
];

export function getAssetTransfers(address: string, {
  fromBlock = 0,
  toBlock = 'latest',
  fromAddress,
  toAddress,
  category = defaultTokenCategories,
  excludeZeroValue,
  maxCount,
  pageKey,
}: GetAssetTransfersOptions = {}): Promise<GetAssetTransfersResponse> {
  return alchemyProvider.send('alchemy_getAssetTransfers', [{
    contractAddresses: [address],
    fromBlock: typeof fromBlock === 'number' ? utils.hexlify(fromBlock) : fromBlock,
    toBlock: typeof toBlock === 'number' ? utils.hexlify(toBlock) : toBlock,
    fromAddress,
    toAddress,
    category,
    excludeZeroValue,
    maxCount,
    pageKey,
  }]);
}

export interface GetNFTSForCollectionOptions {
  withMetadata?: boolean;
  startToken?: string;
}

export interface GetNFTsForCollectionNft {
  id: {
    tokenId: string;
    tokenMetadata?: {
      tokenType: string;
    };
  };
  tokenUri: {
    raw: string;
    gateway: string;
  };
  metadata: any;
}

export interface GetNFTsForCollectionResponse {
  nfts: GetNFTsForCollectionNft[]
}

export function getNFTsForCollection(contractAddress: string, options: GetNFTSForCollectionOptions = {}): Promise<GetNFTsForCollectionResponse> {
  const params = Object.entries({...options, contractAddress}).map(([key, value]) => `${key}=${value}`).join('&');
  const url = `${alchemyProvider.connection.url}/getNFTsForCollection?${params}`;
  return fetchJson(url);
}

export interface GetOwnersForTokenResponse {
  owners: string[];
}

export function getOwnersForToken(contractAddress: string, tokenId: string): Promise<GetOwnersForTokenResponse> {
  const params = Object.entries({contractAddress, tokenId}).map(([key, value]) => `${key}=${value}`).join('&');
  const url = `${alchemyProvider.connection.url}/getOwnersForToken?${params}`;
  return fetchJson(url);
}
