import { Room } from "./Room";

export class Hotel {
  id: string;
  name: string;
  imageURL: string;
  price: number;
  desc: string;
  added: Date;
  available: boolean;

  constructor(
    id: string,
    name: string,
    imageURL: string,
    price: number,
    desc: string,
    added: string,
    available: boolean
  ) {
    this.id = id.toString();
    this.name = name;
    this.imageURL = imageURL;
    this.price = price;
    this.desc = desc;
    this.added = new Date(Date.parse(added));
    this.available = available ?? false;
  }

  public toJson(): any {
    let body: any = {
      name: this.name,
      imageURL: this.imageURL,
      price: this.price,
      description: this.desc,
      added: this.added,
      available: this.available,
    };
    if (this.id) {
      body = { ...body, id: this.id };
    }
    return body;
  }
}
