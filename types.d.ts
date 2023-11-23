interface MulterField {
  name: string;
  maxCount: number;
}

interface ReportSub {
  _id?: string;
  state: string;
  comment: string;
  image: string;
  name: string;
}

interface Reports{
  category: string,
  sub_categories: ReportSub[]
}