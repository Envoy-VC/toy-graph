import type { PropsWithChildren } from 'react';
import { PostHogProvider } from './posthog';

export const ProviderTree = ({ children }: PropsWithChildren) => {
  return <PostHogProvider>{children}</PostHogProvider>;
};
