import useDeliveryStore, {
  PREPARING_DURATION_MS,
  TRANSIT_DURATION_MS,
} from '@/store/delivery.store';

describe('useDeliveryStore', () => {
  beforeEach(() => {
    useDeliveryStore.setState({ startedAt: null, destinationAddress: null });
    jest.restoreAllMocks();
  });

  it('startDelivery beállítja a kezdési időt és címet', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);

    useDeliveryStore.getState().startDelivery('Kisvárda, Kölcsey utca 26');
    const state = useDeliveryStore.getState();

    expect(state.startedAt).toBe(1_000);
    expect(state.destinationAddress).toBe('Kisvárda, Kölcsey utca 26');
  });

  it('isDeliveryInProgress igaz az időablakon belül', () => {
    const startedAt = 10_000;
    useDeliveryStore.setState({ startedAt, destinationAddress: 'X' });

    jest.spyOn(Date, 'now').mockReturnValue(
      startedAt + PREPARING_DURATION_MS + TRANSIT_DURATION_MS - 1
    );

    expect(useDeliveryStore.getState().isDeliveryInProgress()).toBe(true);
  });

  it('isDeliveryInProgress hamis a teljes időablak után', () => {
    const startedAt = 10_000;
    useDeliveryStore.setState({ startedAt, destinationAddress: 'X' });

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(startedAt + PREPARING_DURATION_MS + TRANSIT_DURATION_MS + 1);

    expect(useDeliveryStore.getState().isDeliveryInProgress()).toBe(false);
  });

  it('getTotalRemainingMs null startedAt esetén 0', () => {
    expect(useDeliveryStore.getState().getTotalRemainingMs()).toBe(0);
  });

  it('getTotalRemainingMs helyesen csökken és 0-n clampel', () => {
    const startedAt = 50_000;
    const total = PREPARING_DURATION_MS + TRANSIT_DURATION_MS;
    useDeliveryStore.setState({ startedAt, destinationAddress: 'X' });

    jest.spyOn(Date, 'now').mockReturnValue(startedAt + total - 500);
    expect(useDeliveryStore.getState().getTotalRemainingMs()).toBe(500);

    jest.spyOn(Date, 'now').mockReturnValue(startedAt + total + 500);
    expect(useDeliveryStore.getState().getTotalRemainingMs()).toBe(0);
  });
});
