import { Component } from '@angular/core';
import { Product } from '../shared/models/product';
import { ProductService } from '../shared/services/product.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  products: Product[] = [];

  constructor(private productService: ProductService ) {
    this.products = this.productService.getProducts();
  }

}
