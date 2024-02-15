export class Product {
  name: string;
  price: number;
  image: string;
  id: string; 
  categories: string;
  dealMethod: string;
  details: string;
  condition : string;
  seller : string;
  isFavourite : boolean;
  sellerImage : string;

  constructor(
    name: string,
    price: number,
    image: string,
    id: string,
    categories: string,
    dealMethod: string,
    details: string,
    condition : string,
    seller : string,
    isFavourite : boolean,
    sellerImage : string,
  ) {
    this.name = name;
    this.price = price;
    this.image = image;
    this.id = id;
    this.categories = categories;
    this.dealMethod = dealMethod;
    this.details = details;
    this.condition = condition;
    this.seller = seller;
    this.isFavourite = isFavourite;
    this.sellerImage = sellerImage;
  }
}
