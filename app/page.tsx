import { CustomerTable } from "@/components/customers/customer-table";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6 md:p-10">
      <CustomerTable />
    </main>
  );
}
