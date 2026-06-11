import { isRestaurantOpen } from '@/lib/opening-hours';

describe('isRestaurantOpen', () => {
  it('hétköznap 09:00-kor nyitva van (Budapest idő)', () => {
    const date = new Date('2026-01-15T08:00:00.000Z'); // Thu 09:00 CET
    expect(isRestaurantOpen(date)).toBe(true);
  });

  it('hétköznap 22:00-kor már zárva van (Budapest idő)', () => {
    const date = new Date('2026-01-15T21:00:00.000Z'); // Thu 22:00 CET
    expect(isRestaurantOpen(date)).toBe(false);
  });

  it('vasárnap 20:30-kor nyitva, 21:00-kor zárva (Budapest idő)', () => {
    const openDate = new Date('2026-01-18T19:30:00.000Z'); // Sun 20:30 CET
    const closedDate = new Date('2026-01-18T20:00:00.000Z'); // Sun 21:00 CET

    expect(isRestaurantOpen(openDate)).toBe(true);
    expect(isRestaurantOpen(closedDate)).toBe(false);
  });
});
