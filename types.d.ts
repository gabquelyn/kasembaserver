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

type Profile = {
  avatar: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  country: string;
  zip_code: number;
  city: string;
};

interface IUser {
  email: string;
  password: string;
  roles: "client" | "inspector" | "admin";
  profile: Profile;
  verified: boolean;
}

interface IToken {
  userId: String;
  token: String;
  expireAt: {
    default: Date;
    expires: number;
  };
}
