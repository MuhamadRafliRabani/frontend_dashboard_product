"use client";
import DashboardLayout from "@/components/layout/dashboard-layout";
import TitleTable from "@/components/title-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Data, ProductType } from "@/type";
import { Edit2, MoreHorizontalIcon, Plus, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ProductsPage = () => {
  const [data, setData] = useState<Data<ProductType[]>>();
  const router = useRouter();

  const getProducts = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setData(await res.json());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Produk berhasil dihapus.");
      getProducts();
    } catch (err) {
      console.log(err);
      toast.error("Terjadi kesalahan saat menghapus produk.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <TitleTable title="Manage Product" desc="List of all products" />
        <div className="w-full flex jusctify-end mb-4">
          <Button className="bg-green-500 ms-auto">
            <Link
              href="/dashboard/products/create"
              className="flex items-center gap-1"
            >
              <span>
                <Plus className="size-4" />
              </span>{" "}
              Add Product
            </Link>
          </Button>
        </div>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader className="w-full">
            <TableRow>
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Creby</TableHead>
              <TableHead className="text-right">Cretime</TableHead>
              <TableHead className="text-right">Modby</TableHead>
              <TableHead className="text-right">Modtime</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((item, i) => (
              <TableRow
                key={item.id}
                onClick={() =>
                  router.push(`/dashboard/products/update?id=${item.id}`)
                }
              >
                <TableCell className="font-medium">{i + 1}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {/*  eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="object-cover rounded"
                  />
                </TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell className="text-right">
                  {item.status ? "Active" : "Inactive"}
                </TableCell>
                <TableCell>{item.creby?.toLocaleLowerCase() ?? "-"}</TableCell>
                <TableCell>
                  {item.cretime
                    ? new Date(item.cretime).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell>{item.modby?.toLocaleLowerCase() ?? "-"}</TableCell>
                <TableCell>
                  {item.modtime
                    ? new Date(item.modtime).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="More Options"
                      >
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="default"
                          onClick={(e) => {
                            router.push(
                              `/dashboard/products/update?id=${item.id}`
                            );
                            e.stopPropagation();
                          }}
                        >
                          <Edit2 />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            handleDelete(item.id);
                            router.push(`/dashboard/products`);
                            e.stopPropagation();
                          }}
                        >
                          <Trash2Icon />
                          Trash
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter>
          <TableRow>
            <TableCell colSpan={8}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter> */}
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
