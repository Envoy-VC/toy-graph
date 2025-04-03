import { Perf } from 'r3f-perf';

export const Performance = () => {
  return (
    <>
      <Perf
        position='top-left'
        className={process.env.NODE_ENV === 'development' ? 'block' : 'hidden'}
      />
    </>
  );
};
