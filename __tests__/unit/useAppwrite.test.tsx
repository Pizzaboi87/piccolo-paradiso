import useAppwrite from '@/lib/useAppwrite';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

const Probe = ({ fn, skip = false }: { fn: (p: { q: string }) => Promise<any>; skip?: boolean }) => {
  const { data, loading, error } = useAppwrite({
    fn,
    params: { q: 'alma' },
    skip,
  });

  return (
    <>
      <Text testID="loading">{loading ? '1' : '0'}</Text>
      <Text testID="data">{data ? '1' : '0'}</Text>
      <Text testID="error">{error ?? ''}</Text>
    </>
  );
};

describe('useAppwrite', () => {
  it('automatikusan lekéri az adatot és beállítja a data mezőt', async () => {
    const fn = jest.fn().mockResolvedValue([{ id: 1 }]);
    render(<Probe fn={fn} />);

    await waitFor(() => expect(fn).toHaveBeenCalledWith({ q: 'alma' }));
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('1'));
    expect(screen.getByTestId('loading')).toHaveTextContent('0');
  });

  it('skip=true esetén nem hív fetch-et', async () => {
    const fn = jest.fn().mockResolvedValue([{ id: 1 }]);
    render(<Probe fn={fn} skip />);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fn).not.toHaveBeenCalled();
    expect(screen.getByTestId('loading')).toHaveTextContent('0');
  });

  it('hiba esetén error mezőt tölt', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Backend hiba'));
    render(<Probe fn={fn} />);

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Backend hiba'));
    expect(screen.getByTestId('loading')).toHaveTextContent('0');
  });
});
