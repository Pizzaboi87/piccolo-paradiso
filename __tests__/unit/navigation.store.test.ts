import useNavigationStore from '@/store/navigation.store';

describe('useNavigationStore', () => {
  beforeEach(() => {
    useNavigationStore.getState().clearTrail();
  });

  it('pushSource normalizálja az útvonalat és nem teszi be a /cart-ot', () => {
    const store = useNavigationStore.getState();

    store.pushSource('/(tabs)/index');
    store.pushSource('/cart');

    expect(useNavigationStore.getState().trail).toEqual(['/']);
  });

  it('pushSource deduplikál és max 3 elemet tart', () => {
    const store = useNavigationStore.getState();

    store.pushSource('/search');
    store.pushSource('/search');
    store.pushSource('/item/1');
    store.pushSource('/profile');
    store.pushSource('/orders');

    expect(useNavigationStore.getState().trail).toEqual(['/item/1', '/profile', '/orders']);
  });

  it('consumeBackTarget a megfelelő célt adja és popolja a trail-t', () => {
    useNavigationStore.setState({ trail: ['/search', '/item/1'] });

    const target = useNavigationStore.getState().consumeBackTarget('/cart', '/');

    expect(target).toBe('/item/1');
    expect(useNavigationStore.getState().trail).toEqual(['/search']);
  });

  it('consumeBackTarget fallbacket ad üres trail esetén', () => {
    useNavigationStore.setState({ trail: [] });

    const target = useNavigationStore.getState().consumeBackTarget('/cart', '/');

    expect(target).toBe('/');
  });
});
