import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { Provider } from "@ethersproject/providers"
import { providers } from "ethers"

import * as data from './_data'

export const defaultProvider = new providers.CloudflareProvider()

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

export async function getLogs({fromBlock, toBlock = 'latest', address, topics, provider = defaultProvider, test}: GetLogsOptions) {
  if (test) {
    return data.logs
  }

  return provider.getLogs({address, fromBlock, toBlock, topics})
}
