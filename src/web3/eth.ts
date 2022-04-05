import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { formatFixed } from '@ethersproject/bignumber'
import { Provider } from "@ethersproject/providers"
import { providers } from "ethers"

import { AlchemyApiKey } from './env'
import * as data from './_data'

export const defaultProvider = new providers.CloudflareProvider()
export const alchemyProvider = new providers.AlchemyProvider('homestead', AlchemyApiKey)

export interface ProviderOptions {
  provider?: Provider
  test?: boolean
}

export interface GetBlockDataOptions extends ProviderOptions {
  blockTag?: providers.BlockTag
}

export async function getBlockData({provider = defaultProvider, blockTag = 'latest', test}: GetBlockDataOptions = {}): Promise<BlockWithTransactions> {
  if (test) {
    return data.block;
  }

  const block = await provider.getBlockWithTransactions(blockTag)

  return block;
}

export interface GetLogsOptions extends ProviderOptions {
  fromBlock: providers.BlockTag
  toBlock?: providers.BlockTag
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
  blockTag?: providers.BlockTag
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
