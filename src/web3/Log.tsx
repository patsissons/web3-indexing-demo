import {ButtonGroup, Card, Collapsible, Link, List, Stack} from '@shopify/polaris'
import { providers, utils } from "ethers";
import { useState } from 'react';

import { JsonData } from "./JsonData";

export interface Props {
  log: providers.Log
}

export function Log({log}: Props) {
  const [payloadVisible, setPayloadVisible] = useState(false)
  const {blockNumber, logIndex, transactionHash, address, data, topics} = log

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
          <List.Item><code>{`${utils.hexStripZeros(topics[1])} → ${utils.hexStripZeros(topics[2])}`}</code></List.Item>
          <List.Item><p>Quantity: {utils.formatUnits(data, 'wei')}</p></List.Item>
        </List>
      </Card.Section>
      <Card.Section title="Contract Details" actions={[{content: 'Contract', url: `https://etherscan.io/address/${address}#code`, external: true}]}>
        <p>{address}</p>
      </Card.Section>
      <Collapsible id={JSON.stringify({blockNumber, logIndex})} open={payloadVisible}>
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
}
