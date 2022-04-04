import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { useCallback, useState } from 'react'
import { Block } from './Block'
import { getBlockData } from './eth'

export function Web3IndexingDemo() {
  const [data, setData] = useState<BlockWithTransactions>()
  const getData = useCallback(async () => {
    setData(undefined)
    const block = await getBlockData({test: true})
    setData(block)
  }, [])

  return (
    <div style={{display: 'flex', flexFlow: 'column nowrap', width: '100%'}}>
      <button style={{alignSelf: 'center', fontSize: 20}} onClick={getData}>Fetch Current Block</button>
      <div style={{width: '100%', textAlign: 'left', overflow: 'auto'}}>{data && <Block block={data} />}</div>
    </div>
  )
}
