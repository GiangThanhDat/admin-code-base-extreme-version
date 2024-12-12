"use client";

import { createPaginationFiltersStore } from "@/utils/custom-stores";
import { DefaultDataGrid } from "../components/lib/default-data-grid";
import { Column } from "devextreme-react/data-grid";

const orderCustomerStore = createPaginationFiltersStore(
  "/order-customer/get-all",
  "id",
);

export default function OrderCustomerPage() {
  return (
    <DefaultDataGrid dataSource={orderCustomerStore} keyExpr={"id"}>
      <Column dataField="code" caption="Ma Phieu" />
      <Column dataField="name" caption="Ten" />
    </DefaultDataGrid>
  );
}
