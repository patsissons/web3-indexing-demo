import { PageProps, Loading, Page, Banner } from '@shopify/polaris'
import { providers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { getBlockData, getLogs } from './eth'
import { JsonData } from './JsonData'
import { Log } from './Log'

// ethers.utils.id('Transfer(address,address,uint256)')
const defaultTopics = ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']

export interface Props {
  topics?: string[]
}

export function Web3IndexingDemo({
  topics = defaultTopics,
}: Props) {
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [loadingLatest, setLoadingLatest] = useState(false)
  const [logsError, setLogsError] = useState<any>()
  const [blockError, setBlockError] = useState<any>()
  const [logs, setLogs] = useState<providers.Log[]>()
  const [fromBlock, setFromBlock] = useState<number>()
  const [latestBlock, setLatestBlock] = useState<number>()

  const fetchLatest = useCallback(async () => {
    try {
      setLoadingLatest(true)
      const block = await getBlockData()

      setLatestBlock(block.number)
    } catch (err) {
      setBlockError(err)
    } finally {
      setLoadingLatest(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      if (!fromBlock) {
        return
      }

      setLoadingLogs(true)
      setLogsError(undefined)

      const newLogs = await getLogs({fromBlock, toBlock: fromBlock, topics})
      const [last] = newLogs.slice(-1)
      const filteredLogs = newLogs.filter((log) => !isInvalidERC20(log))

      setLogs((current) => current ? current.concat(filteredLogs) : filteredLogs)
      setFromBlock(last.blockNumber)
    } catch (err) {
      setLogsError(err)
    } finally {
      setLoadingLogs(false)
    }
  }, [fromBlock, topics])

  useEffect(() => {
    if (latestBlock && (!fromBlock || latestBlock - fromBlock > 128)) {
      setFromBlock(latestBlock - 128);
    }
  }, [fromBlock, latestBlock])

  useEffect(() => {
    fetchLatest()
  }, [fetchLatest])

  const fetchLogsAction: PageProps['primaryAction'] = {
    content: loadingLogs || !latestBlock || !fromBlock
      ? 'Loading...'
      : `Fetch Logs @ ${fromBlock} (-${latestBlock - fromBlock})`,
    disabled: !latestBlock || loadingLogs || latestBlock === fromBlock,
    onAction: fetchLogs,
  }
  const fetchLatestBlockActions: PageProps['secondaryActions'] = [{
    content: loadingLatest || !latestBlock ? 'Loading...' : 'Fetch latest block',
    disabled: loadingLatest,
    onAction: fetchLatest,
  }]

  return (
    <>
      {loadingLatest || loadingLogs ? <Loading /> : null}
      <Page title="Web3 Indexing Demo" subtitle={`${logs?.length || 0} log entries`} primaryAction={fetchLogsAction} secondaryActions={fetchLatestBlockActions}>
        {logsError && <Banner title="Fetch Logs Error" status="critical"><JsonData data={logsError} /></Banner>}
        {logsError && <Banner title="Fetch Block Error" status="critical"><JsonData data={blockError} /></Banner>}
        {logs && logs.map(renderLog)}
      </Page>
    </>
  )

  function renderLog(log: providers.Log) {
    const {blockNumber, logIndex} = log

    return <Log key={JSON.stringify({blockNumber, logIndex})} log={log} />
  }

  function isInvalidERC20(log: providers.Log) {
    return log.removed || log.topics.length !== 3 || log.data === '0x'
  }
}
