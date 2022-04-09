import { Banner, Form, Layout, Link, List, Loading, Page, TextField } from "@shopify/polaris";
import {
  useField,
  useForm,
  submitSuccess,
  submitFail,
} from '@shopify/react-form';
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssetTransfers, getNFTsForCollection, GetNFTsForCollectionNft, TokenTransfer } from "./eth";
import { JsonData } from "./JsonData";

export function TokenDetails() {
  const {tokenAddress} = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [transfers, setTransfers] = useState<TokenTransfer[]>();
  const [nfts, setNfts] = useState<GetNFTsForCollectionNft[]>()

  const initialTransfersLoaded = Boolean(transfers);

  const {submit, fields} = useForm({
    fields: {
      address: useField(tokenAddress),
    },
    async onSubmit({address}) {
      try {
        if (address) {
          window.history.pushState(undefined, '', `/token/${address}`)
          await Promise.all([fetchNfts(address), fetchTransfers(address)]);
        }
        return submitSuccess();
      } catch (error) {
        return submitFail();
      }
    }
  })

  const fetchNfts = useCallback(async (address: string) => {
    try {
      const {nfts} = await getNFTsForCollection(address);

      setNfts(nfts);
    } catch (error) {
      setError(error);
    }
  }, []);

  // 0x603eb6
  const fetchTransfers = useCallback(async (address: string) => {
    try {
      setLoading(true);
      setTransfers(undefined);

      let nextPageKey: string | undefined;
      let pageCount = 0;

      // 0x603eb6
      while (true) {
        const {transfers, pageKey} = await getAssetTransfers(address, {pageKey: nextPageKey})

        setTransfers((prev) => prev ? prev.concat(transfers) : transfers);

        if (!pageKey) {
          break;
        }

        nextPageKey = pageKey;
        if (++pageCount >= 1) {
          break;
        }
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   async function load(address: string) {
  //     fetchTransfers(address);
  //   }

  //   if (tokenAddress) {
  //     load(tokenAddress);
  //   }
  // }, [fetchTransfers, tokenAddress]);

  useEffect(() => {
    if (initialTransfersLoaded) {
      setLoading(false);
    }
  }, [initialTransfersLoaded]);

  return (
    <>
      {loading ? <Loading /> : null}
      <Page title="Token Details" subtitle={tokenAddress} primaryAction={{content: 'Fetch Transfers', onAction: submit}}>
        <Layout>
          <Layout.Section>
            <Banner title="some contract addresses to try" status="info">
              <List>
                <List.Item>
                  <Link url="/token/0x33023E456aF4C186A32c57f8ad61c34cB33f5cC1">SQUAD: 0x33023E456aF4C186A32c57f8ad61c34cB33f5cC1</Link>
                </List.Item>
                <List.Item>
                  <Link url="/token/0x72541Ad75E05BC77C7A92304225937a8F6653372">BlootElvesNFT: 0x72541Ad75E05BC77C7A92304225937a8F6653372</Link>
                </List.Item>
                <List.Item>
                  <Link url="/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</Link>
                </List.Item>
              </List>
            </Banner>
          </Layout.Section>
        </Layout>
        <Form onSubmit={submit}>
          <TextField {...fields.address} label="Token Address" autoComplete="off" />
        </Form>
        {error && <Banner title="Asset Transfer Details Error" status="critical"><JsonData data={error} /></Banner>}
        {stats()}
        <JsonData data={nfts} />
        <JsonData data={transfers} />
      </Page>
    </>
  )

  function stats() {
    if (!transfers) {
      return null;
    }

    const categories = transfers.reduce((map, t) => {
      return map.set(t.category, (map.get(t.category) ?? 0) + 1)
    }, new Map<string, number>());

    return [
      `${nfts?.length || 0} nfts`,
      `${transfers.length} transfers: ${Array.from(categories.entries()).map(([cat, amount]) => `${cat}: ${amount}`).join(', ')}`,
    ].join(', ');
  }
}
