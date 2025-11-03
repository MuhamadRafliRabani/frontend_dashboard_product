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
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useSession } from "next-auth/react";
import { OrderType, ProductType } from "@/type";

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

const UpdateOrderPage = () => {
  const param = useSearchParams();
  const orderCode = param.get("code");
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      order_code: "",
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

  const getOrder = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/show/${orderCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil data order");

      const result = await res.json();
      const order: OrderType = result.data;

      const formatDateForInput = (date: Date | string | null) => {
        if (!date) return "";
        const dateObj = new Date(date);
        return dateObj.toISOString().split("T")[0];
      };

      form.reset({
        order_code: order.order_code,
        product_id: order?.product_id?.toString(),
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        payment_type: order.payment_type,
        start_process: formatDateForInput(order.start_process),
        end_process: formatDateForInput(order.end_process),
      });

      const product = products.find(
        (p) => p.id.toString() === order?.product_id?.toString()
      );
      if (product) {
        setSelectedProduct(product);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengambil data order");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (orderCode && products.length > 0) {
      getOrder();
    }
  }, [orderCode, products]);

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(
        (p) => p.id.toString() === watchedProductId
      );
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

    const product = products.find((p) => p.id.toString() === value);
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

  const getSelectedProductDisplay = () => {
    if (!watchedProductId) return "Pilih produk";

    const product = products.find((p) => p.id.toString() === watchedProductId);
    return product
      ? `${product.name} - ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(product.price)}`
      : "Pilih produk";
  };

  // Fungsi untuk handle date conversion yang lebih aman
  const handleDateConversion = (dateString: string | undefined | null) => {
    if (!dateString || dateString.trim() === "") {
      return null;
    }

    try {
      const date = new Date(dateString);
      // Validasi apakah date valid
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderData: Record<string, any> = {
        ...values,
        product_id: parseInt(values.product_id),
        modby: session?.user?.name ?? "admin",
        modtime: new Date().toISOString(),
        start_process: handleDateConversion(values.start_process),
        end_process: handleDateConversion(values.end_process),
      };

      // Hapus field yang null agar tidak dikirim
      if (orderData.start_process === null) {
        delete orderData.start_process;
      }
      if (orderData.end_process === null) {
        delete orderData.end_process;
      }

      console.log("Data yang dikirim:", orderData);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/update/${orderCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!res.ok) throw new Error("Gagal mengupdate order");

      toast.success("Order berhasil diupdate.");
      getOrder();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengupdate order.");
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk clear end_process
  const handleClearEndProcess = () => {
    form.setValue("end_process", "");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <h1 className="text-2xl font-semibold mb-6">Update Order</h1>

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
                    <Input
                      placeholder="ORD-123456"
                      {...field}
                      readOnly
                      className="bg-gray-100"
                    />
                  </FormControl>
                  <FormDescription>
                    Kode unik untuk identifikasi order (tidak dapat diubah).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pilih Produk */}
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
                        <SelectValue placeholder={getSelectedProductDisplay()}>
                          {getSelectedProductDisplay()}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products
                        .filter((product) => product.status)
                        .map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
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

            {/* Quantity */}
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

            {/* Tanggal Selesai Proses dengan tombol clear */}
            <FormField
              control={form.control}
              name="end_process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Selesai Proses</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearEndProcess}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    Tanggal ketika order selesai diproses (opsional). Kosongkan
                    jika belum selesai.
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
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default UpdateOrderPage;
