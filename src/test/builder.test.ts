import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

type Product = { id: number; cat: string; price: number };
type Selection = Record<string, { id: number; quantity: number }>;
let rules: { rows: (s: Selection, p: Product[]) => { quantity: number }[]; totals: (s: Selection, p: Product[]) => { card: number; pix: number; count: number } };
beforeAll(() => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync('public/catchau/builder-logic.js', 'utf8'), context);
  rules = context['CatchauBuilder'];
});
describe('PC builder', () => {
  it('keeps product IDs and rejects selections from the wrong category', () => {
    expect(rules.rows({ cpu: { id: 0, quantity: 1 }, ram: { id: 0, quantity: 1 } }, [{ id: 0, cat: 'cpu', price: 1000 }])).toHaveLength(1);
  });
  it('uses the same 15% PIX discount as the storefront', () => {
    const result = rules.totals({ cpu: { id: 0, quantity: 2 } }, [{ id: 0, cat: 'cpu', price: 1000 }]);
    expect(result.card).toBe(2000);
    expect(result.pix).toBe(1700);
  });
  it('does not count optional peripherals as PC components', () => {
    expect(rules.totals({ per: { id: 47, quantity: 1 } }, [{ id: 47, cat: 'per', price: 100 }]).count).toBe(0);
  });
  it('ignores products that are no longer in the catalog', () => {
    expect(rules.totals({ cpu: { id: 999, quantity: 1 } }, []).card).toBe(0);
  });
});