import { Link, List } from "@shopify/polaris";
import { TokenTransfer } from "./eth";

export interface Props {
  transfer: TokenTransfer;
}

export function Transfer({transfer: {blockNum, from, hash, to}}: Props) {
  return (
    <List>
      <List.Item>
        <Link url={`https://etherscan.io/address/${from}`} external>{from}</Link>
        {` → `}
        <Link url={`https://etherscan.io/address/${to}`} external>{to}</Link>
      </List.Item>
      <List.Item>
        <Link url={`https://etherscan.io/tx/${hash}`} external>{hash}</Link>
        {` @ `}
        <Link url={`https://etherscan.io/block/${blockNum}`} external>{blockNum}</Link>
      </List.Item>
    </List>
  )
}
