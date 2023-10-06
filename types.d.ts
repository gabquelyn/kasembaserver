interface ICat {
  name: string;
  sub_categories: [
    {
      name: string;
      options: string[];
      image_upload: boolean;
    }
  ];
  cost: number;
  plan: string;
}

interface IUser {
  email: string;
  password: string;
  roles: "client" | "inspector" | "admin";
  avatar: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  country: string;
  zip_code: number;
  city: string;
  verified: boolean;
  cars: ObjectId[]
}

interface IToken {
  userId: String;
  token: string;
  expireAt: {
    default: Date;
    expires: number;
  };
}

interface ICar {
  userId: String;
  type: "new" | "used";
  images: string[];
  vin: string;
  color: string;
  description: string;
  sell: boolean;
  sell_type: string;
  currency: string;
  cost: number;
  showcase: [{ day: string; from: string; to: string }];
}

interface InspectionFormData extends ICar {
  country: string;
  city: string;
  address: string;
  zip_code: string;
  category: string[];
}
