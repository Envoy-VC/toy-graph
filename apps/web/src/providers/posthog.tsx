// app/providers.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { env } from '~/env';

export const PostHogProvider = ({
  children,
}: { children: React.ReactNode }) => {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      person_profiles: 'always',
      // biome-ignore lint/style/useNamingConvention: <explanation>
      capture_pageview: false,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
};

const PostHogPageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }

      // biome-ignore lint/style/useNamingConvention: <explanation>
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
};

const SuspendedPostHogPageView = () => {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
};
