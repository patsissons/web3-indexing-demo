import {AppProvider, Frame} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';
import { TokenDetails } from './web3/TokenDetails';
import { Web3IndexingDemo } from './web3/Web3IndexingDemo';

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <Frame>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Web3IndexingDemo />} />
            <Route path="/token" element={<TokenDetails />}>
              <Route path="/token/:tokenAddress" element={<TokenDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Frame>
    </AppProvider>
  )
}

export default App;
