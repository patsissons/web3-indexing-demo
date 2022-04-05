import { formatFixed } from '@ethersproject/bignumber'
import {ButtonGroup, Card, Collapsible, Link, List, Stack, Image} from '@shopify/polaris'
import { providers, utils } from "ethers";
import { useEffect, useState } from 'react';
import { getTokenBalances, getTokenMetadata, GetTokenMetadataResponse } from './eth';

import { JsonData } from "./JsonData";

export interface Props {
  log: providers.Log
}

export function Log({log}: Props) {
  const [token, setToken] = useState<GetTokenMetadataResponse>()
  const [fromBalance, setFromBalance] = useState<number>()
  const [toBalance, setToBalance] = useState<number>()
  const [payloadVisible, setPayloadVisible] = useState(false)
  const {blockNumber, logIndex, transactionHash, address, data, topics} = log

  const id = JSON.stringify({blockNumber, logIndex})
  const from = utils.hexStripZeros(topics[1])
  const to = utils.hexStripZeros(topics[2])

  useEffect(() => {
    async function load() {
      const token = await getTokenMetadata(address)

      setToken(token)
    }

    load()
  }, [address])

  useEffect(() => {
    async function load() {
      const fromBalance = await getTokenBalances(from, address)

      setFromBalance(fromBalance)
    }

    load()
  }, [address, from])

  useEffect(() => {
    async function load() {
      const toBalance = await getTokenBalances(to, address)

      setToBalance(toBalance)
    }

    load()
  }, [address, to])

  return (
    <Card>
      <Card.Header title={`${transactionHash}:${logIndex}`}>
        <Stack distribution="trailing">
          <ButtonGroup>
            <Link url={`https://etherscan.io/block/${blockNumber}`} external>Block</Link>
            <Link url={`https://etherscan.io/txs?block=${blockNumber}`} external>Transactions</Link>
          </ButtonGroup>
        </Stack>
      </Card.Header>
      <Card.Section title="Transfer Details">
        <List>
          <List.Item><code>{`${from} → ${to}`}</code></List.Item>
          <List.Item><p>Quantity: {formatQuantity()}</p></List.Item>
        </List>
      </Card.Section>
      <Card.Section title="Current Balance">
        <List>
          <List.Item>
            {'From '}
            <Link url={`https://etherscan.io/address/${from}`} external>{from}</Link>
            {fromBalance ? `: ${formatBalance(fromBalance)}`: 'Loading balance...'}
          </List.Item>
          <List.Item>
            {'To '}
            <Link url={`https://etherscan.io/address/${to}`} external>{to}</Link>
            {toBalance ? `: ${formatBalance(toBalance)}`: 'Loading balance...'}
          </List.Item>
        </List>
      </Card.Section>
      <Card.Section title="Contract Details" actions={[{content: 'Contract', url: `https://etherscan.io/address/${address}#code`, external: true}]}>
        <Stack alignment="center">
          {token?.logo && <Image size={64} source={token.logo} alt={`${token.name || 'token'} logo`} />}
          <Stack vertical>
            <p>{address}</p>
            {(token?.name || token?.symbol) && <p>{[token.name, token.symbol].filter(Boolean).join(' | ')}</p>}
            {!token && <p>Loading token metadata...</p>}
            <Collapsible id={`${id}-token`} open={payloadVisible}>
              <JsonData data={token} />
            </Collapsible>
          </Stack>
        </Stack>
      </Card.Section>
      <Collapsible id={id} open={payloadVisible}>
        <Card.Section title="Log Payload" subdued>
          <JsonData data={log} />
        </Card.Section>
      </Collapsible>
      <Card.Section>
        <Stack>
          <Stack.Item fill>
            <Link onClick={() => setPayloadVisible((value) => !value)}>{`${payloadVisible ? 'Hide' : 'Show'} payload`}</Link>
          </Stack.Item>
          <ButtonGroup>
            <Link url={`https://etherscan.io/tx/${transactionHash}`} external>Transaction</Link>
            <Link url={`https://etherscan.io/tx/${transactionHash}#eventlog`} external>Logs</Link>
          </ButtonGroup>
        </Stack>
      </Card.Section>
    </Card>
  )

  function formatQuantity() {
    let balance = Number(formatFixed(data))

    return formatBalance(balance)
  }

  function formatBalance(balance: number) {
    const amount = token?.decimals ? balance / Math.pow(10, token.decimals) : balance

    return `${amount}${token?.symbol ? ` ${token.symbol}` : ''}`
  }

  // function formatTransfer() {
  //   const fromAmount = fromBalance && token?.decimals ? fromBalance / Math.pow(10, token.decimals) : fromBalance
  //   const toAmount = toBalance && token?.decimals ? toBalance / Math.pow(10, token.decimals) : toBalance

  //   return [
  //     `${from}${fromAmount ? ` (${fromAmount}${token?.symbol ? ` ${token.symbol}` : ''})` : ''}`,
  //     `${to}${toAmount ? ` (${toAmount}${token?.symbol ? ` ${token.symbol}` : ''})` : ''}`,
  //   ].join(' → ')
  // }
}
