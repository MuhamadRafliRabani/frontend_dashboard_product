"use client";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react/jsx-runtime";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const DashboardHeader = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const ListPage = pathname.split("/");
  const currentPage = pathname.split("/").pop();
  const { data: session, status } = useSession();
  console.log("🚀 ~ DashboardHeader ~ session:", session);

  useEffect(() => {
    if (status === "unauthenticated") {
      push("/");
    }
  }, [status, push]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {ListPage &&
              ListPage?.slice(1)?.map((page, index) => (
                <Fragment key={index}>
                  {index !== 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem>
                    {currentPage === page ? (
                      <BreadcrumbPage className="capitalize">
                        {page?.toLowerCase()}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={`/${ListPage.slice(1, index + 2).join("/")}`}
                      >
                        <BreadcrumbPage className="capitalize">
                          {page?.toLowerCase()}
                        </BreadcrumbPage>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export default DashboardHeader;
