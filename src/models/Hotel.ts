import { Room } from "./Room";

export class Hotel {
  _id: string;
  name: string;
  imageURL: string;
  price: number;
  desc: string;
  added: Date;
  available: boolean;
  modified: boolean;
  lat?: number;
  lng?: number;

  constructor(
    id: string,
    name: string,
    imageURL: string,
    price: number,
    desc: string,
    added: string,
    available: boolean,
    lat?: number,
    lng?: number,
    modified?: boolean,
  ) {
    this._id = id.toString();
    this.name = name;
    this.imageURL = imageURL;
    this.price = price;
    this.desc = desc;
    this.added = new Date(Date.parse(added));
    this.available = available ?? false;
    this.modified = modified ?? false;
    this.lat = lat;
    this.lng = lng;
  }

  public toJson(): any {
    let body: any = {
      name: this.name,
      imageURL: this.imageURL,
      price: this.price,
      description: this.desc,
      added: this.added,
      available: this.available,
      lng: this.lng,
      lat: this.lat,
    };
    if (this._id) {
      body = { ...body, _id: this._id };
    }
    return body;
  }
}
