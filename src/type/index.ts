export interface ProductType {
  id: number;
  name: string;
  image: string;
  price: number;
  status: boolean;
  stock: number;
  creby?: string;
  cretime?: string;
  modby?: string;
  modtime?: string;
}

export interface Data<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrderType {
  id: string;
  order_code: string;
  product_name: string;
  product_id?: number;
  quantity: number;
  price: number;
  status: "pending" | "processing" | "completed" | "cancle";
  start_process: Date;
  end_process: Date;
  payment_type: string;
  creby?: string;
  cretime?: Date;
  modby?: string;
  modtime?: Date;
}

export type ActionType = "create" | "update" | "delete";
