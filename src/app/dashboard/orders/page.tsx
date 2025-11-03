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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Data, OrderType } from "@/type";
import { Edit2, MoreHorizontalIcon, Plus, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const OrdersPage = () => {
  const [data, setData] = useState<Data<OrderType[]>>();
  const router = useRouter();

  const getOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setData(await res.json());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getOrders();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Pesanan berhasil dihapus.");
      getOrders();
    } catch (err) {
      console.log(err);
      toast.error("Terjadi kesalahan saat menghapus pesanan.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <TitleTable title="Manage Orders" desc="List of all orders" />
        <div className="w-full flex jusctify-end mb-4">
          <Button className="bg-green-500 ms-auto">
            <Link
              href="/dashboard/orders/create"
              className="flex items-center gap-1"
            >
              <span>
                <Plus className="size-4" />
              </span>{" "}
              Add Orders
            </Link>
          </Button>
        </div>
        <Table>
          <TableCaption>Daftar pesanan terbaru.</TableCaption>
          <TableHeader className="w-full">
            <TableRow>
              <TableHead className="w-[100px]">Order Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Start Process</TableHead>
              <TableHead>End Process</TableHead>
              <TableHead className="text-right">Creby</TableHead>
              <TableHead className="text-right">Cretime</TableHead>
              <TableHead className="text-right">Modby</TableHead>
              <TableHead className="text-right">Modtime</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((item) => (
              <TableRow
                key={item.order_code}
                onClick={() =>
                  router.push(`/dashboard/orders/update?code=${item.id}`)
                }
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{item.order_code}</TableCell>
                <TableCell className="font-medium">
                  {item.product_name}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(item.price)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : item.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : item.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>{item.payment_type}</TableCell>
                <TableCell>
                  {item.start_process
                    ? new Date(item.start_process).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell>
                  {item.end_process
                    ? new Date(item.end_process).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.creby?.toLowerCase() ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.cretime
                    ? new Date(item.cretime).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.modby?.toLowerCase() ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.modtime
                    ? new Date(item.modtime).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="More Options"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/dashboard/orders/update?code=${item.id}`
                            );
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
