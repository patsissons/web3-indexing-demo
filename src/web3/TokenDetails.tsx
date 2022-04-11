import { formatFixed } from "@ethersproject/bignumber";
import { Banner, Card, Collapsible, Form, Link, List, Loading, Page, TextField } from "@shopify/polaris";
import {
  useField,
  useForm,
  submitSuccess,
  submitFail,
} from '@shopify/react-form';
import { utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssetTransfers, getNFTsForCollection, GetNFTsForCollectionNft, getOwnersForToken, TokenTransfer } from "./eth";
import { JsonData } from "./JsonData";
import { Transfer } from "./Transfer";

export function TokenDetails() {
  const {tokenAddress} = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [transfers, setTransfers] = useState<TokenTransfer[]>();
  const [nfts, setNfts] = useState<GetNFTsForCollectionNft[]>();
  const [owners, setOwners] = useState<string[]>();
  const [payloadVisible, setPayloadVisible] = useState<string>();

  const initialTransfersLoaded = Boolean(transfers);

  const {submit, fields} = useForm({
    fields: {
      address: useField(tokenAddress),
    },
    async onSubmit({address}) {
      try {
        setLoading(true);
        setNfts(undefined)
        setOwners(undefined);
        setTransfers(undefined);

        if (address) {
          const uriPath = `/token/${address}`;
          if (window.location.pathname !== uriPath) {
            window.history.pushState(undefined, '', uriPath)
          }

          const nftsOrError = await fetchNfts(address);

          if (Array.isArray(nftsOrError)) {
            if (nftsOrError.length > 0) {
              return submitSuccess();
            }
          } else {
            throw nftsOrError;
          }

          const transferCountOrError = await fetchTransfers(address);

          if (typeof transferCountOrError === 'number') {
            return submitSuccess();
          } else {
            throw transferCountOrError;
          }
        }

        throw new Error('Token address is required');
      } catch (error) {
        setError(error);
        return submitFail();
      } finally {
        setLoading(false);
      }
    }
  })

  const fetchNfts = useCallback(async (address: string) => {
    try {
      const {nfts} = await getNFTsForCollection(address);

      if (nfts.length > 0) {
        setNfts(nfts);

        const tokenIds = nfts.map(({id: {tokenId}}) => tokenId);

        for (const tokenId of tokenIds) {
          const {owners} = await getOwnersForToken(address, tokenId);

          const moreOwners = owners.map((owner) => utils.defaultAbiCoder.decode(['address'], utils.hexZeroPad(owner, 32))[0])
          setOwners((current) => (current || []).concat(...moreOwners));
        }
      }

      return nfts;
    } catch (error: any) {
      return error;
    }
  }, []);

  const fetchTransfers = useCallback(async (address: string) => {
    try {
      let nextPageKey: string | undefined;
      let pageCount = 0;
      let transferCount = 0;

      while (true) {
        const {transfers, pageKey} = await getAssetTransfers(address, {pageKey: nextPageKey})

        transferCount += transfers.length;
        setTransfers((prev) => prev ? prev.concat(transfers) : transfers);

        if (!pageKey) {
          break;
        }

        nextPageKey = pageKey;
        if (++pageCount >= 1) {
          break;
        }
      }

      return transferCount;
    } catch (error: any) {
      return error
    }
  }, []);

  useEffect(() => {
    if (initialTransfersLoaded) {
      setLoading(false);
    }
  }, [initialTransfersLoaded]);

  return (
    <>
      {loading ? <Loading /> : null}
      <Page title="Token Details" subtitle={tokenAddress}>
        <Card primaryFooterAction={{content: 'Fetch Transfers', onAction: submit}}>
          <Card.Section>
            <Banner title="some contract addresses to try" status="info">
              <List>
                <List.Item>
                  <Link url="/token/0x33023E456aF4C186A32c57f8ad61c34cB33f5cC1">SQUAD: 0x33023E456aF4C186A32c57f8ad61c34cB33f5cC1</Link>
                </List.Item>
                <List.Item>
                  <Link url="/token/0xda749d35f5be1f7248aa7280b97444739c61fe51">Summit 2022: 0xda749d35f5be1f7248aa7280b97444739c61fe51</Link>
                </List.Item>
                <List.Item>
                  <Link url="/token/0x72541Ad75E05BC77C7A92304225937a8F6653372">BlootElvesNFT: 0x72541Ad75E05BC77C7A92304225937a8F6653372</Link>
                </List.Item>
                <List.Item>
                  <Link url="/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</Link>
                </List.Item>
              </List>
            </Banner>
          </Card.Section>
          {error && (
            <Card.Section>
              <Banner title="Asset Transfer Details Error" status="critical"><JsonData data={error} replacer={Object.getOwnPropertyNames(error)} /></Banner>
            </Card.Section>
          )}
          <Card.Section>
            <Form onSubmit={submit}>
              <TextField {...fields.address} label="Token address" autoComplete="off" />
            </Form>
          </Card.Section>
        </Card>
        {(nfts || transfers) && (
          <Card title={cardTitle()} actions={[{content: 'View Contract', url: `https://etherscan.io/address/${tokenAddress}`, external: true}]}>
            {nfts && (
              <Card.Section>
                <Card.Subsection>
                  <List>
                    {nfts.map(({id: {tokenId}}) => (
                      <List.Item key={tokenId}>
                        <Link url={`https://etherscan.io/nft/${tokenAddress}/${Number(formatFixed(tokenId))}`} external>{utils.hexStripZeros(tokenId)}</Link>
                      </List.Item>
                    ))}
                  </List>
                </Card.Subsection>
                {owners && (
                  <Card.Subsection>
                    <List>
                      {owners.map((owner) => (
                        <List.Item key={owner}>
                          <Link url={`https://etherscan.io/address/${owner}`} external>{owner}</Link>
                        </List.Item>
                      ))}
                    </List>
                  </Card.Subsection>
                )}
              </Card.Section>
            )}
            {transfers && transfers.map((transfer, index) => {
              const id = [transfer.hash, index].join('-');
              return (
                <Card.Section key={id} title={`${transfer.value} ${transfer.asset}`} actions={[{content: 'Toggle payload', onAction: togglePayloadAction(id)}]}>
                  <Transfer transfer={transfer} />
                  <Collapsible id={id} open={payloadVisible === id}>
                    <Card.Subsection>
                      <JsonData data={transfer} />
                    </Card.Subsection>
                  </Collapsible>
                </Card.Section>
              );
            })}
          </Card>
        )}
      </Page>
    </>
  )

  function togglePayloadAction(hash: string) {
    return function togglePayload() {
      setPayloadVisible((prev) => prev === hash ? undefined : hash);
    };
  }

  function cardTitle() {
    if (nfts) {
      let title = `${nfts.length} NFTs`;

      if (!owners) {
        return title;
      }

      return `${title}, ${owners.length} owners`;
    }

    if (transfers) {
      return `${transfers.length} transfers`;
    }
  }
}
