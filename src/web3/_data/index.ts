import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import {providers} from 'ethers'

import blockJson from './block.json'
import logsJson from './logs.json'

export const block = blockJson as any as BlockWithTransactions
export const logs = logsJson as providers.Log[]
