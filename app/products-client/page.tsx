"use client";

import { request } from "@/utils/custom-stores";
import { Button } from "devextreme-react";
import { ColumnChooserSearch } from "devextreme-react/cjs/tree-list";
import DataGrid, {
  Column,
  ColumnChooser,
  ColumnChooserSelection,
  ColumnFixing,
  DataGridRef,
  Editing,
  FilterPanel,
  FilterRow,
  Grouping,
  GroupPanel,
  HeaderFilter,
  Item,
  Pager,
  Paging,
  Scrolling,
  Search,
  SearchPanel,
  Selection,
  Sorting,
  StateStoring,
  Summary,
  Toolbar,
  TotalItem,
} from "devextreme-react/data-grid";
import { RefObject, useRef, useState } from "react";

const {
  data: { items: products },
} = await request("/product/get-all", {
  method: "POST",
  body: JSON.stringify({
    filterColumn: [],
    pageIndex: 1,
    pageSize: 1000000,
    sortColumn: "Id",
    sortOrder: 0,
    isPage: false,
  }),
});

export default function ProductsPage() {
  const ref = useRef<DataGridRef>(null);
  const [expanded, setExpanded] = useState(true);

  return (
    <DataGrid
      ref={ref}
      keyExpr={"id"}
      id="product-client-data-grid"
      columnAutoWidth
      allowColumnResizing
      allowColumnReordering
      showBorders
      showRowLines
      rowAlternationEnabled
      dataSource={products}
    >
      <ColumnChooser enabled mode="select">
        <ColumnChooserSearch enabled />
        <ColumnChooserSelection allowSelectAll selectByClick recursive />
      </ColumnChooser>
      <Selection mode="multiple" deferred />
      <Sorting mode="multiple" />
      <FilterRow visible showOperationChooser />
      <Scrolling mode="standard" rowRenderingMode="standard" />
      <Paging enabled defaultPageSize={1000000} />
      <Pager
        visible
        showInfo
        showNavigationButtons
        showPageSizeSelector
        displayMode="adaptive"
        allowedPageSizes={"auto"}
      />
      <StateStoring
        enabled
        type="localStorage"
        storageKey="APPLICATION_STORAGE"
      />
      <HeaderFilter visible>
        <Search enabled mode="contains" />
      </HeaderFilter>
      <SearchPanel visible />
      <FilterPanel visible />
      <GroupPanel visible />
      <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons />
      <Summary>
        {/* <GroupItem summaryType="count" /> */}
        <TotalItem column="priceBuy" summaryType="sum" valueFormat="currency" />
        <TotalItem
          column="priceBuy1"
          summaryType="sum"
          valueFormat={"currency"}
        />
        <TotalItem
          column="priceBuy2"
          summaryType="sum"
          valueFormat={"currency"}
        />
      </Summary>
      <Toolbar>
        <Grouping autoExpandAll={expanded} />
        <Item name="groupPanel" />
        <Item location="after">
          <Button
            text={expanded ? "Collapse All" : "Expand All"}
            width={136}
            onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
          />
        </Item>
        <Item>
          <Button
            type="normal"
            text="Reset"
            onClick={() =>
              (ref as RefObject<DataGridRef>)?.current?.instance().state(null)
            }
          />
        </Item>
        <Item name="addRowButton" />
        <Item name="columnChooserButton" />
        <Item name="searchPanel" />
      </Toolbar>
      {/* <Column dataField="branchName" /> */}
      <ColumnFixing enabled />
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
        dataField="unitName"
        dataType="string"
        // cellRender={(props) => <>{props.data.unitName}</>}
        caption="Don vi"
      />
      <Column
        dataField="unit1Id"
        caption="Đơn vị tính 1"
        cellRender={(props) => <>{props.data.unit1Name}</>}
      />
      <Column
        dataField="unit2Id"
        cellRender={(props) => <>{props.data.unit2Name}</>}
        caption="Đơn vị tính 2"
      />
      <Column dataField="warehouseId" caption="Kho hàng" />
      <Column dataField="weight" dataType="number" caption="Khối lượng" />
      <Column dataField="weight1" dataType="number" caption="Khối lượng 1" />
      <Column dataField="weight2" dataType="number" caption="Khối lượng 2" />
      <Column dataField="img" caption="Ảnh minh họa" />
    </DataGrid>
  );
}
