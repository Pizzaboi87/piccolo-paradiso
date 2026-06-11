import { useCartStore } from '@/store/cart.store';

const margherita = {
  id: 'item-1',
  name: 'Margherita',
  price: 2200,
  image_url: 'https://example.com/m.jpg',
};

const extraCheese = { id: 'c-1', name: 'Extra sajt', price: 300, type: 'topping' };
const largeSize = { id: 'c-2', name: 'Nagy', price: 500, type: 'size' };

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('összevonja az azonos tételt azonos testreszabással', () => {
    const store = useCartStore.getState();

    store.addItem({ ...margherita, customizations: [extraCheese], note: 'kevesebb só' });
    store.addItem({ ...margherita, customizations: [extraCheese], note: 'kevesebb só' });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('külön tételként kezeli a különböző megjegyzést', () => {
    const store = useCartStore.getState();

    store.addItem({ ...margherita, customizations: [extraCheese], note: 'A' });
    store.addItem({ ...margherita, customizations: [extraCheese], note: 'B' });

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('customization sorrendtől függetlenül ugyanazt a tételt növeli', () => {
    const store = useCartStore.getState();

    store.addItem({ ...margherita, customizations: [extraCheese, largeSize], note: '' });
    store.addItem({ ...margherita, customizations: [largeSize, extraCheese], note: '' });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('decreaseQty 0 mennyiségnél törli az elemet', () => {
    const store = useCartStore.getState();

    store.addItem({ ...margherita, customizations: [], note: '' });
    store.decreaseQty(margherita.id, [], '');

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('getTotalItems és getTotalPrice helyesen számol', () => {
    const store = useCartStore.getState();

    store.addItem({ ...margherita, customizations: [extraCheese], note: '' });
    store.addItem({ ...margherita, customizations: [extraCheese], note: '' });

    const totalItems = useCartStore.getState().getTotalItems();
    const totalPrice = useCartStore.getState().getTotalPrice();

    expect(totalItems).toBe(2);
    expect(totalPrice).toBe(2 * (2200 + 300));
  });
});
