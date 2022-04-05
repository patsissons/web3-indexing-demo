import {AppProvider, Frame} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

import './App.css';
import { Web3IndexingDemo } from './web3/Web3IndexingDemo';

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <Frame>
        <Web3IndexingDemo />
      </Frame>
    </AppProvider>
  )
}

export default App;
