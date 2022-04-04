import { JsonFragment } from '@ethersproject/abi'
import { BlockWithTransactions } from '@ethersproject/abstract-provider'

import blockJson from './block.json'
import erc20Json from './erc20.abi.json'
import erc721Json from './erc721.abi.json'
import erc1155Json from './erc1155.abi.json'

export const block = blockJson as any as BlockWithTransactions
export const erc20 = erc20Json as JsonFragment[]
export const erc721 = erc721Json as JsonFragment[]
export const erc1155 = erc1155Json as JsonFragment[]
