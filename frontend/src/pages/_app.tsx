import React from 'react';
import type { AppProps } from 'next/app';
import Navbar from '../app/components/layout/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;