import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { Provider } from "@ethersproject/providers"
import { providers } from "ethers"

import * as data from './_data'

export const defaultProvider = new providers.CloudflareProvider()

export interface GetBlockDataOptions {
  provider?: Provider
  blockHashOrBlockTag?: providers.BlockTag
  test?: boolean
}

export async function getBlockData({provider = defaultProvider, blockHashOrBlockTag, test}: GetBlockDataOptions = {}): Promise<BlockWithTransactions> {
  if (test) {
    return data.block;
  }

  const blockNum = blockHashOrBlockTag || await provider.getBlockNumber()
  const block = await provider.getBlockWithTransactions(blockNum)

  return block;
}
