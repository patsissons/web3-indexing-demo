import { BlockWithTransactions, TransactionResponse } from '@ethersproject/abstract-provider'
import { JsonData } from './JsonData'
import { Transaction } from './Transaction'

export interface Props {
  block: BlockWithTransactions
}

export function Block({block}: Props) {
  const {transactions, ...data} = block

  return (
    <div style={{fontSize: 10}}>
      <div style={{color: 'cyan'}}><JsonData data={data} /></div>
      {transactions.map(renderTransaction)}
    </div>
  )

  function renderTransaction(tx: TransactionResponse) {
    return (
      <Transaction key={tx.hash} tx={tx} />
    )
  }
}
