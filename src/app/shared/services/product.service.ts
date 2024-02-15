import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  products: Product[] = [];

  constructor() { 
    this.products = [
      new Product('Uniqlo Beige Set', 20, 'assets/products/beigeSweatshirt.jpg', '1', 'BT', 'Delivery', 'Worn one to two times', 'used', 'Marcus Soh', true, 'assets/sellers/profile1.jpg'),
      new Product('Uniqlo Brown Set', 50, 'assets/products/brownSweatshirt.jpg', '2', 'BT', 'Delivery', 'Worn one to two times', 'likely used', 'Marcus Soh', true, 'assets/sellers/profile2.jpg'),
      new Product('Brown Oversize Tee', 35, 'assets/products/beigeOversizeTee.jpg', '3', 'BT', 'Meet Up', 'Worn one to two times', 'used', 'Marcus Soh', false, 'assets/sellers/profile3.jpg'),
      new Product('Grey Sweatpants', 10, 'assets/products/sweatpants.jpg', '4', 'BS', 'Meet Up', 'Worn one to two times', 'heavily used', 'Marcus Soh', false, 'assets/sellers/profile4.jpg'),
      new Product('White Puffer Coat', 15, 'assets/products/coat.jpg', '5', 'BS', 'Meet Up', 'Worn one to two times', 'used', 'Marcus Soh', false, 'assets/sellers/profile5.jpg'),
      new Product('White Puffer Coat', 15, 'assets/products/coat.jpg', '5', 'BS', 'Meet Up', 'Worn one to two times', 'used', 'Marcus Soh', false, 'assets/sellers/profile5.jpg')
    ];    
    }

  //Get a the products in the product class
  getProducts(): Product[] {
    return this.products;
    }

}
