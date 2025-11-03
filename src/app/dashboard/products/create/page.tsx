"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama produk minimal 2 karakter." }),
  image: z.file({ message: "Masukkan URL gambar yang valid." }).optional(),
  price: z.coerce.number().min(1, { message: "Harga harus lebih dari 0." }),
  status: z.boolean(),
  stock: z.coerce.number().min(0, { message: "Stok tidak boleh negatif." }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateProductPage = () => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      image: undefined,
      price: 0,
      status: true,
      stock: 0,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setLoading(true);

      const productData = new FormData();
      productData.append("name", values.name);
      productData.append("price", values.price.toString());
      productData.append(
        "status",
        values.status as boolean as unknown as string
      );
      productData.append("stock", values.stock.toString());
      productData.append("creby", session?.user?.name ?? "admin");
      productData.append("cretime", new Date().toISOString());

      if (values.image) {
        productData.append("image", values.image);
      }

      const res = await fetch("http://localhost:8080/api/products/create", {
        method: "POST",
        body: productData,
      });

      if (!res.ok) throw new Error("Gagal menambahkan produk");

      toast.success("Produk berhasil ditambahkan.");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menambahkan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto mt-10 p-6">
        <h1 className="text-2xl font-semibold mb-6">Tambah Produk Baru</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nama Produk */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Kaos Polos" {...field} />
                  </FormControl>
                  <FormDescription>
                    Masukkan nama produk yang jelas dan deskriptif.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL Gambar */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Gambar</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Unggah gambar produk (format .jpg, .png, .jpeg).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Harga */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="10.000"
                        value={
                          field.value === 0
                            ? ""
                            : new Intl.NumberFormat("id-ID").format(field.value)
                        }
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\./g, "");
                          const numericValue = parseInt(rawValue) || 0;
                          field.onChange(numericValue);
                        }}
                        className="ps-10 pb-1.5"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        IDR
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>Harga produk dalam Rupiah.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status - Menggunakan Checkbox */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Status Produk</FormLabel>
                    <FormDescription>
                      Centang untuk mengaktifkan produk. Produk aktif akan
                      ditampilkan kepada pelanggan.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stok */}
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="10.000"
                      value={
                        field.value === 0
                          ? ""
                          : new Intl.NumberFormat("id-ID").format(field.value)
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\./g, "");
                        const numericValue = parseInt(rawValue) || 0;
                        field.onChange(numericValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah stok produk yang tersedia.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CreateProductPage;
