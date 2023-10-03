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
