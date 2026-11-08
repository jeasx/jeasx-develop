import Alpine from "alpinejs";

globalThis.Alpine = Alpine;

// The coffee bar: the menu comes from the server, everything else is client state.
Alpine.data("coffeeBar", (menu) => ({
  menu,
  drink: "cappuccino",
  size: "m",
  extras: [],
  order: [],
  get item() {
    const drink = this.menu.drinks.find((d) => d.id === this.drink);
    const size = this.menu.sizes.find((s) => s.id === this.size);
    const extras = this.menu.extras.filter((e) => this.extras.includes(e.id));
    const price = drink.price * size.factor + extras.reduce((sum, e) => sum + e.price, 0);
    return { drink, size, extras, price };
  },
  get total() {
    return this.order.reduce((sum, item) => sum + item.price, 0);
  },
  add() {
    this.order.push({ ...this.item, key: Date.now() });
    this.extras = [];
  },
  remove(key) {
    this.order = this.order.filter((item) => item.key !== key);
  },
  euro(value) {
    return value.toLocaleString("en", { style: "currency", currency: "EUR" });
  },
}));

Alpine.start();
