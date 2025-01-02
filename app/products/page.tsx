"use client";

import {
  createPaginationFiltersStore,
  createQueryComponent,
} from "@/utils/custom-stores";
import { Column, HeaderFilter, DataGridRef } from "devextreme-react/data-grid";
import { useRef } from "react";
import { DefaultDataGrid } from "../components/lib/default-data-grid";

type Unit = {
  id: number;
  code: string;
  name: string;
};

type Warehouse = Unit;

const productStore = createPaginationFiltersStore("/product");
const unitStore = createQueryComponent("/unit/get-component");
const warehouseStore = createQueryComponent("/warehouse/get-component");

const unitHeaderFilterSource = {
  store: unitStore,
  map: (item: Unit) => ({
    text: `${item.code} - ${item.name}`,
    value: item.id,
  }),
};

const warehouseHeaderFilterSource = {
  store: warehouseStore,
  map: (item: Warehouse) => ({
    text: `${item.code} - ${item.name}`,
    value: item.id,
  }),
};

export default function ProductsPage() {
  const dataGridRef = useRef<DataGridRef>(null);
  return (
    <DefaultDataGrid
      keyExpr={"id"}
      id="demo-grid"
      ref={dataGridRef}
      dataSource={productStore}
    >
      <Column dataField="code" caption="Mã hàng hóa" />
      <Column dataField="note" caption="Ghi chú" />
      <Column dataField="name" caption="Tên hàng hóa" />
      <Column
        dataField="priceBuy"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Giá mua"
      />
      <Column
        dataField="priceBuy1"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Giá mua 1"
      />
      <Column
        dataField="priceBuy2"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Giá mua 2"
      />
      <Column
        dataField="priceSale"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Giá bán"
      />
      <Column
        dataField="priceSale1"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Giá bán 1"
      />
      <Column
        dataField="priceSale2"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Giá bán 2"
      />
      <Column
        dataField="unitId"
        dataType="string"
        cellRender={(props) => <>{props.data.unitName}</>}
        caption="Don vi "
      >
        <HeaderFilter dataSource={unitHeaderFilterSource} />
      </Column>
      <Column
        dataField="unit1Id"
        caption="Đơn vị tính 1"
        cellRender={(props) => <>{props.data.unit1Name}</>}
      >
        <HeaderFilter dataSource={unitHeaderFilterSource} />
      </Column>
      <Column
        dataField="unit2Id"
        cellRender={(props) => <>{props.data.unit2Name}</>}
        caption="Đơn vị tính 2"
      >
        <HeaderFilter dataSource={unitHeaderFilterSource} />
      </Column>
      <Column dataField="warehouseId" caption="Kho hàng">
        <HeaderFilter dataSource={warehouseHeaderFilterSource} />
      </Column>
      <Column dataField="weight" dataType="number" caption="Khối lượng" />
      <Column dataField="weight1" dataType="number" caption="Khối lượng 1" />
      <Column dataField="weight2" dataType="number" caption="Khối lượng 2" />
      <Column dataField="img" caption="Ảnh minh họa" />
    </DefaultDataGrid>
  );
}
