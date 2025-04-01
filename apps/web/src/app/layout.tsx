import { GeistSans } from 'geist/font/sans';
import { TRPCReactProvider } from '~/trpc/react';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import '@repo/ui/globals.css';
import { seo } from '~/lib/seo';

export const metadata = seo;

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html
      className={GeistSans.variable}
      lang='en'
    >
      <body>
        <TRPCReactProvider>
          <main>{children}</main>
        </TRPCReactProvider>
        <Toaster richColors={true} />
      </body>
    </html>
  );
};

export default RootLayout;
