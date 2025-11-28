class order_book {
    private buy = new Map<number, any>();
    private sell = new Map<number, any>();
    
    add_order ( side : string, price : number, order : number){
        const order_book = side === "buy" ? this.buy : this.sell;
        if(!order_book.has(price)) order_book.set(price, []);
        order_book.get(price).push(order);
    }

    get_bast_price_for_buy (){
        return Math.max(...this.buy.keys())
    }

    get_bast_price_for_sell (){
        return Math.min(...this.sell.keys())
    }


    get_order_book (side : string , price : number){
        const order_book = side === "buy" ? this.buy : this.sell;   
        return  order_book.get(price) || [];
    }
}

export {order_book}