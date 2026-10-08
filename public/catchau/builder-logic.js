/* Pure builder rules shared with focused tests. */
(function (root) {
  const slots = [
    { key: 'cpu', name: 'Processador', icon: 'cpu' },
    { key: 'cooler', name: 'Cooler do processador', icon: 'cpu' },
    { key: 'mobo', name: 'Placa-mãe', icon: 'ram' },
    { key: 'ram', name: 'Memória RAM', icon: 'ram' },
    { key: 'gpu', name: 'Placa de vídeo', icon: 'gpu' },
    { key: 'ssd', name: 'Armazenamento SSD', icon: 'ssd' },
    { key: 'psu', name: 'Fonte de alimentação', icon: 'ssd' },
    { key: 'case', name: 'Gabinete', icon: 'mon' },
    { key: 'mon', name: 'Monitor', icon: 'mon', optional: true },
    { key: 'per', name: 'Periférico', icon: 'per', optional: true },
  ];
  function rows(selection, products) {
    return slots.flatMap(slot => {
      const entry = selection[slot.key];
      const product = entry && products.find(p => p && p.id === entry.id && p.cat === slot.key);
      return product ? [{ slot, product, quantity: Math.min(10, Math.max(1, Math.floor(Number(entry.quantity) || 1))) }] : [];
    });
  }
  function totals(selection, products) {
    const selected = rows(selection, products);
    const card = selected.reduce((sum, r) => sum + r.product.price * r.quantity, 0);
    return { card, pix: card * .85, count: selected.filter(r => !r.slot.optional).length, items: selected.reduce((sum, r) => sum + r.quantity, 0) };
  }
  root.CatchauBuilder = { slots, rows, totals };
})(globalThis);