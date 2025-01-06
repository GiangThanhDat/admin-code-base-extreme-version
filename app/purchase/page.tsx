"use client";

import { createQueryComponent, request } from "@/utils/custom-stores";
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
  Lookup,
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
  data: { items: purchaseList },
} = await request("/purchase/get-all", {
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

const supplierStore = createQueryComponent("/supplier");

const lookupSupplier = {
  store: supplierStore,
  sort: "id",
};

const getInitialFilterRangeDate = () => {
  const date = new Date();
  return [new Date(date.getFullYear(), date.getMonth(), 1), date];
};

const initialFilterRangeDate = getInitialFilterRangeDate();

export default function PurchasePage() {
  const ref = useRef<DataGridRef>(null);
  const [expanded, setExpanded] = useState(true);

  return (
    <DataGrid
      ref={ref}
      keyExpr={"id"}
      id="purchase-page-client-data-grid"
      columnAutoWidth
      allowColumnResizing
      allowColumnReordering
      showBorders
      showRowLines
      rowAlternationEnabled
      dataSource={purchaseList}
      defaultFilterValue={[["purchaseTime", "between", initialFilterRangeDate]]}
    >
      <ColumnChooser enabled mode="select">
        <ColumnChooserSearch enabled />
        <ColumnChooserSelection allowSelectAll selectByClick recursive />
      </ColumnChooser>
      <Toolbar>
        <Item name="groupPanel" />
        <Item>
          <Button
            type="normal"
            text="Reset"
            onClick={() =>
              (ref as RefObject<DataGridRef>)?.current?.instance().state(null)
            }
          />
        </Item>
        <Item location="after">
          <Button
            text={expanded ? "Collapse All" : "Expand All"}
            width={135}
            onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
          />
        </Item>
        <Item name="addRowButton" />
        <Item name="columnChooserButton" />
        <Item name="searchPanel" />
      </Toolbar>
      <Selection mode="multiple" deferred />
      <Sorting mode="multiple" />
      <FilterRow visible showOperationChooser />
      <Scrolling mode="standard" rowRenderingMode="standard" />
      <Paging enabled defaultPageSize={1000000} />
      <Grouping
        autoExpandAll={expanded}
        contextMenuEnabled={true}
        expandMode="rowClick"
      />
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
        <TotalItem
          column="id"
          showInColumn="purchaseTime"
          summaryType="count"
          valueFormat=",##0.##"
          // displayFormat="{0}"
        />
        <TotalItem
          column="totalAmount"
          summaryType="sum"
          valueFormat=",##0.##"
          displayFormat="{0}"
        />
      </Summary>
      <ColumnFixing enabled />
      <Column dataField="purchaseTime" caption="Ngay lap" dataType="date" />
      <Column dataField="code" caption="Ma phieu" />
      <Column dataField="numberOfCode" caption="So phieu" />
      <Column dataField="supplierId" caption="Nha cung cap">
        <Lookup
          dataSource={lookupSupplier}
          displayExpr={"name"}
          valueExpr={"id"}
        />
      </Column>
      <Column
        dataField="totalAmount"
        dataType="number"
        alignment="right"
        format=",##0.##"
        caption="Tong cong"
      />
      <Column dataField="deliveryName" caption="Nguoi giao" />
    </DataGrid>
  );
}
