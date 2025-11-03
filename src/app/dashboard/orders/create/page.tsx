"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  order_code: z.string().min(1, { message: "Kode order wajib diisi." }),
  product_id: z.string().min(1, { message: "Produk wajib dipilih." }),
  quantity: z.coerce.number().min(1, { message: "Quantity minimal 1." }),
  price: z.coerce.number().min(1, { message: "Harga harus lebih dari 0." }),
  status: z.enum(["pending", "processing", "completed", "cancle"]),
  payment_type: z.string().min(1, { message: "Tipe pembayaran wajib diisi." }),
  start_process: z.string().optional(),
  end_process: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: boolean;
}

const CreateOrderPage = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  console.log("🚀 ~ CreateOrderPage ~ selectedProduct:", selectedProduct);
  const { data: session } = useSession();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      order_code: `ORD-${Date.now()}`,
      product_id: "",
      quantity: 1,
      price: 0,
      status: "pending",
      payment_type: "",
      start_process: new Date().toISOString().split("T")[0],
      end_process: "",
    },
  });

  const watchedProductId = form.watch("product_id");
  const watchedQuantity = form.watch("quantity");

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`
      );
      if (!res.ok) throw new Error("Gagal mengambil data produk");
      const data = await res.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Gagal mengambil data produk");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (watchedProductId && watchedQuantity > 0) {
      const product = products.find((p) => p.id === selectedProduct?.id);

      if (product) {
        setSelectedProduct(product);
        const totalPrice = product.price * watchedQuantity;
        form.setValue("price", totalPrice);
      } else {
        setSelectedProduct(null);
        form.setValue("price", 0);
      }
    } else {
      setSelectedProduct(null);
      form.setValue("price", 0);
    }
  }, [watchedProductId, watchedQuantity, products, form]);

  const handleProductChange = (value: string) => {
    form.setValue("product_id", value);

    form.setValue("quantity", 1);

    const product = products.find((p) => p.id === value);
    if (product) {
      setSelectedProduct(product);
      form.setValue("price", product.price * 1);
    } else {
      setSelectedProduct(null);
      form.setValue("price", 0);
    }
  };

  const handleQuantityChange = (value: number) => {
    const maxStock = selectedProduct?.stock || 999;
    const safeValue = Math.min(Math.max(1, value), maxStock);
    form.setValue("quantity", safeValue);

    if (selectedProduct) {
      form.setValue("price", selectedProduct.price * safeValue);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setLoading(true);

      const orderData = {
        ...values,
        product_id: parseInt(values.product_id),
        creby: session?.user?.name ?? "admin",
        cretime: new Date().toISOString(),
        start_process: values.start_process
          ? new Date(values.start_process).toISOString()
          : null,
        end_process: values.end_process
          ? new Date(values.end_process).toISOString()
          : null,
      };

      console.log("Data yang dikirim:", orderData);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!res.ok) throw new Error("Gagal membuat order");

      toast.success("Order berhasil dibuat.");
      form.reset({
        order_code: `ORD-${Date.now()}`,
        product_id: "",
        quantity: 1,
        price: 0,
        status: "pending",
        payment_type: "",
        start_process: new Date().toISOString().split("T")[0],
        end_process: "",
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat membuat order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <h1 className="text-2xl font-semibold mb-6">Buat Order Baru</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Kode Order */}
            <FormField
              control={form.control}
              name="order_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Order</FormLabel>
                  <FormControl>
                    <Input placeholder="ORD-123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Kode unik untuk identifikasi order.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pilih Produk - PERBAIKAN DI SINI */}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Produk</FormLabel>
                  <Select
                    onValueChange={handleProductChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk">
                          {/* Custom display untuk value yang dipilih */}
                          {field.value
                            ? (() => {
                                const selected = products.find(
                                  (p) => p.id === selectedProduct?.id
                                );
                                return selected ? (
                                  <span>
                                    {selected.name} -{" "}
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                    }).format(selected.price)}
                                  </span>
                                ) : (
                                  "Pilih produk"
                                );
                              })()
                            : "Pilih produk"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products
                        .filter((product) => product.status)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} -{" "}
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(product.price)}{" "}
                            (Stok: {product.stock})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih produk dari daftar yang tersedia.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Debug Info */}
            {/* <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> Product ID:{" "}
                {watchedProductId || "None"}, Quantity: {watchedQuantity},
                Selected Product: {selectedProduct?.name || "None"}
              </p>
            </div> */}

            {/* Info Produk Terpilih */}
            {selectedProduct && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-medium mb-2 text-blue-900">
                  Info Produk Terpilih:
                </h3>
                <p className="text-blue-800">
                  <strong>Nama:</strong> {selectedProduct.name}
                </p>
                <p className="text-blue-800">
                  <strong>Harga Satuan:</strong>{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(selectedProduct.price)}
                </p>
                <p className="text-blue-800">
                  <strong>Stok Tersedia:</strong> {selectedProduct.stock}
                </p>
              </div>
            )}

            {/* Quantity - PERBAIKAN DI SINI */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={selectedProduct?.stock || 999}
                      value={field.value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        handleQuantityChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah pesanan. Maksimal:{" "}
                    {selectedProduct?.stock || "tidak terbatas"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Harga */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Harga</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      className="bg-gray-100 font-medium"
                      value={new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(field.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Total harga: {watchedQuantity} ×{" "}
                    {selectedProduct
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(selectedProduct.price)
                      : "Rp 0"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Order */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Order</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancle">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Status saat ini dari order.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipe Pembayaran */}
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Pembayaran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                      <SelectItem value="debit_card">Kartu Debit</SelectItem>
                      <SelectItem value="e-wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Metode pembayaran yang digunakan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanggal Mulai Proses */}
            <FormField
              control={form.control}
              name="start_process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai Proses</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tanggal ketika order mulai diproses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanggal Selesai Proses */}
            <FormField
              control={form.control}
              name="end_process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Selesai Proses</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tanggal ketika order selesai diproses (opsional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedProduct}
                className="flex-1"
              >
                {loading ? "Menyimpan..." : "Simpan Order"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrderPage;
