'use client';

import { Toaster } from 'sonner';
import { InputForm } from '~/components';
import { Canvas } from '~/three/canvas';

const Home = () => {
  return (
    <>
      <div className='h-screen w-full bg-[#E9E3C7]'>
        <Canvas />
      </div>
      <InputForm />
      <Toaster />
    </>
  );
};

export default Home;
