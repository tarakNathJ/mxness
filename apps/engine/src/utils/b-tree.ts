class order_book {
  public buy = new Map<number, any>();
  public sell = new Map<number, any>();

  // add treade
  add_order(side: string, price: number, order: object) {
    const order_book = side === "long" ? this.buy : this.sell;
    if (!order_book.has(price)) order_book.set(price, []);
    order_book.get(price).push(order);
  }
  // delete treade
  delete_order(user_id: string, side: string) {
    const order_book = side === "long" ? this.buy : this.sell;

    for (const [price, orders] of order_book) {
      const index = orders.findIndex((order: any) => order.user === user_id);
      if (index !== -1) {
        orders.splice(index, 1);
        if (orders.length === 0) {
          order_book.delete(price);
        }

        return;
      }
    }
  }
  cancel_trade(id: number, side: string ,quantity:number) {
    const order_book = side === "long" ? this.buy : this.sell;

    for (const [price, orders] of order_book) {
      const index = orders.findIndex((order: any) => order.id === id && order.qty === quantity);
      if (index !== -1) {
        orders.splice(index, 1);
        if (orders.length === 0) {
          order_book.delete(price);
        }

        return;
      }
    }
  }

  get_order_book(side: string, price: number) {
    const order_book = side === "long" ? this.buy : this.sell;
    return order_book.get(price) || [];
  }
}

export { order_book };
