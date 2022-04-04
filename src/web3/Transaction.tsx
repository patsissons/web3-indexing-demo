import { JsonFragment } from '@ethersproject/abi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Interface } from '@ethersproject/abi'
import { utils } from 'ethers'
import { JsonData } from './JsonData'

import {erc20, erc721, erc1155} from './_data'

export interface Props {
  tx: TransactionResponse
}

export function Transaction({tx}: Props) {
  const methodHex = utils.hexDataSlice(tx.data, 0, 4)
  const abiFunc = abiFunctions[methodHex]
  const {sig, abi} = abiFunc || {}
  const iface = abi ? new Interface(abi) : undefined
  const fn = iface ? iface.getFunction(sig) : undefined
  const inputs = iface ? iface.decodeFunctionData(sig, tx.data) : undefined
  const inputParams = (fn && inputs) ? inputs.map((value, i) => ({arg: fn.inputs[i].name, value})) : undefined

  return (
    <div>
      <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer">Etherscan</a>
      <JsonData data={{
        methodHex,
        sig,
        inputParams,
        payload: tx,
      }} />
    </div>
  )
}

interface AbiFunction {
  sig: string
  func: JsonFragment
  abi: JsonFragment[]
}

const abiFunctions = [erc20, erc721, erc1155].reduce<Record<string, AbiFunction>>((map, abi) => {
  return abi.reduce((map, func) => {
    const params = (func.inputs || []).map(({type}) => type).join(',')
    const sig = `${func.name}(${params})`
    const hash = utils.id(sig)
    const hexSlice = utils.hexDataSlice(hash, 0, 4)

    return {
      ...map,
      [hexSlice]: {sig, func, abi},
    }
  }, map)
}, {})
