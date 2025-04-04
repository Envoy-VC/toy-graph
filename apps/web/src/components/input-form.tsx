'use client';
import { api } from '~/trpc/react';
import { Logo } from './logo';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { toast } from 'sonner';

import { HomeIcon, Loader2, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { Vector3 } from 'three';
import { useActivityStore } from '~/stores';

const years = Array.from({ length: 2026 - 2016 }, (_, i) => 2016 + i).reverse();

export const InputForm = () => {
  const {
    setData,
    characterRef,
    isInitialData,
    setIsInitialData,
    setIsPhysicsEnabled,
  } = useActivityStore();
  const { mutateAsync, isPending, error } =
    api.github.getContributions.useMutation();

  const [username, setUsername] = useState<string>('');
  const [year, setYear] = useState<number>(2025);

  const onSubmit = async () => {
    const res = await mutateAsync({
      username: username,
      year: year,
    });

    if ('error' in res) {
      toast.error(res.error);
      return;
    }

    // Disable physics when the data is about to load
    setIsPhysicsEnabled(false);
    characterRef?.current?.setTranslation(new Vector3(-40, 5, 20), true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setData(res.value);
    setIsInitialData(false);

    // Enable physics after the data is loaded
    setIsPhysicsEnabled(true);
  };

  if (isInitialData) {
    return (
      <div className='absolute top-0 right-1/2 z-[2] mx-auto flex w-full max-w-[20rem] translate-x-1/2 flex-col gap-4 sm:max-w-md md:max-w-lg lg:max-w-xl'>
        <div className='mx-auto flex size-[10rem] items-center justify-center sm:size-[12rem] md:size-[14rem]'>
          <Logo width='100%' />
        </div>
        <div className='mx-auto flex w-full max-w-md flex-col items-center justify-evenly gap-2 sm:flex-row'>
          <div className='flex flex-row items-center gap-2'>
            <div className='flex h-9 flex-row items-center gap-2 rounded-lg border-2 border-black bg-[#ded096] px-2'>
              <SearchIcon className='h-4 w-4 text-neutral-700' />
              <Input
                placeholder='Github username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPending ?? username.length === 0}
                className='border-none px-0 text-neutral-700 shadow-none outline-none placeholder:text-neutral-700 focus-visible:outline-none focus-visible:ring-0'
              />
            </div>
            <Select
              value={year.toString()}
              onValueChange={(value) => setYear(Number(value))}
              disabled={isPending}
            >
              <SelectTrigger className='w-[100px] rounded-lg border-2 border-black bg-[#ded096] text-neutral-700 shadow-none outline-none focus-visible:outline-none focus-visible:ring-0'>
                <SelectValue placeholder='Year' />
              </SelectTrigger>
              <SelectContent className='border-none bg-[#ded096] text-neutral-700'>
                {years.map((year) => (
                  <SelectItem
                    className='focus:bg-[#d7c57c]'
                    key={year}
                    value={year.toString()}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={onSubmit}
            disabled={isPending || username.length === 0}
            className='w-full max-w-[160px] rounded-lg border-2 border-black bg-[#D51328] shadow hover:bg-[#d51326ca]'
          >
            {isPending ? (
              <div className='flex flex-row items-center gap-2'>
                <Loader2 className='size-4 animate-spin' />
                <span className=''>Generating...</span>
              </div>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='absolute top-4 right-4 z-[2]'>
      <Button
        onClick={() => setIsInitialData(true)}
        className='!size-12 cursor-pointer rounded-full border-2 border-black bg-[#D51328] shadow hover:bg-[#D51328]'
        size='icon'
      >
        <HomeIcon className='size-6' />
      </Button>
    </div>
  );
};
