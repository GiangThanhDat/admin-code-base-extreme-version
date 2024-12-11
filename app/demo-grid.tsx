"use client";

import { Button } from "devextreme-react";
import {
  DataGrid,
  Column,
  RemoteOperations,
  ColumnFixing,
  ColumnChooser,
  FilterRow,
  SearchPanel,
  Editing,
  Summary,
  Toolbar,
  Item,
  Grouping,
  Selection,
  Pager,
  Paging,
  Scrolling,
  HeaderFilter,
  Search,
  FilterPanel,
  GroupPanel,
  Button as GridButton,
  ColumnChooserSearch,
  ColumnChooserSelection,
  StateStoring,
  DataGridRef,
  TotalItem,
} from "devextreme-react/data-grid";
import { FilterDescriptor } from "devextreme/data";
import CustomStore from "devextreme/data/custom_store";
import { useRef, useState } from "react";

type Unit = {
  id: number;
  code: string;
  name: string;
};

type Warehouse = Unit;

type PaginationResponse<T> = {
  code: number;
  data: {
    items: T[];
    total: number;
    summary: number;
  };
};

type FetchResponse<T> = {
  ok: boolean;
  statusText: string;
  json: () => PaginationResponse<T>;
};

function handleErrors<T>(response: FetchResponse<T>) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export const capitalizeFirstLetter = (string: string) => {
  return (string && string[0].toUpperCase() + string.slice(1)) || "";
};

const processNegations = (negationGroup: [string, string, unknown][]) => {
  for (const subFilter of negationGroup)
    if (Array.isArray(subFilter)) {
      subFilter[1] = "!=";
    }
};

const createFilterColumn = (filter: FilterDescriptor | FilterDescriptor[]) => {
  const map: Record<
    string,
    { column: string; expression: string; keySearch: string[] }
  > = {};
  if (!filter) return [];
  // try {
  const queue = [...filter];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];

    if (item === "!" && queue[i + 1]) {
      processNegations(queue[i + 1]);
    }

    if (item[0] === "!" && item[1]) {
      processNegations(item[1]);
    }

    if (typeof item[0] === "string" && !["a", "o", "!"].includes(item[0])) {
      const [column, expression, keySearch] = item;

      if (!keySearch) continue;

      const operation = expression === "=" ? "IN" : "NOT IN";

      if (!map[column]) {
        map[column] = {
          column: capitalizeFirstLetter(column),
          expression: operation,
          keySearch: [keySearch],
        };
      } else {
        map[column].keySearch.push(keySearch);
      }
    } else if (Array.isArray(item)) {
      queue.push(...item);
    }
  }

  return Object.values(map).map((item) => ({
    ...item,
    keySearch: `(${item.keySearch.toString()})`,
  }));
  // } catch (error) {
  //   console.log("error:", error);
  // }
};

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmltYXJ5c2lkIjoiNTkiLCJ1bmlxdWVfbmFtZSI6ImFkbWluIiwiZ3JvdXBzaWQiOiIxMiIsIkludm9pY2VDb25maWdJZCI6IjAiLCJCcmFuY2hJZHMiOiIiLCJTdGFmZklkIjoiMzMiLCJXYXJlaG91c2VJZHMiOiIiLCJVc2VyQ2FzaGllcklkcyI6IjIwMCw1OSIsIlBheW1lbnRUeXBlSWQiOiIyIiwibmJmIjoxNzMzNzM3MzUxLCJleHAiOjE3MzYzMjkzNTEsImlhdCI6MTczMzczNzM1MX0.Zo-Hu5CRQjEMzb-5S-0R7LPgzjZFFlzeCHl3DmqsBLI";

const customDataSource = new CustomStore({
  key: "id",
  load: async (loadOptions) => {
    console.log("are you fine?");
    const { skip = 0, take = 1, filter } = loadOptions;
    const filterColumn = createFilterColumn(filter) || [
      { column: "string", keySearch: "string", expression: "string" },
    ];

    return fetch(
      "https://api-restaurant-dev.phanmemviet.net.vn/product/get-all",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          filterColumn,
          pageIndex: skip / take + 1,
          pageSize: take,
          sortColumn: "Id",
          sortOrder: 0,
          isPage: false,
        }),
      },
    )
      .then((response) =>
        handleErrors(response as unknown as FetchResponse<Unit>),
      )
      .then((response) => response.json())
      .then((response) => {
        return {
          data: response.data.items,
          totalCount: response.data.total,
          summary: response.data.summary,
        };
      })
      .catch(() => {
        throw "Network error";
      });
  },
});

const unitStore = new CustomStore({
  load: async (loadOptions) => {
    const { skip = 0, take = 1, searchValue } = loadOptions;

    const params = new URLSearchParams({
      id: "0",
      keySearch: searchValue || "",
      pageIndex: `${skip / take + 1}`,
      pageSiez: `${take}`,
      isGetAll: "true",
    }).toString();

    return fetch(
      `https://api-restaurant-dev.phanmemviet.net.vn/unit/get-component?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) =>
        handleErrors(response as unknown as FetchResponse<Unit>),
      )
      .then((response) => response.json())
      .then((response) => {
        return {
          data: response.data.items,
          totalCount: response.data.total,
          summary: response.data.summary,
        };
      })
      .catch(() => {
        throw Error("Network error");
      });
  },
});

const warehouseStore = new CustomStore({
  load: async (loadOptions) => {
    const { skip = 0, take = 1, searchValue } = loadOptions;

    const params = new URLSearchParams({
      id: "0",
      keySearch: searchValue || "",
      pageIndex: `${skip / take + 1}`,
      pageSize: `${take}`,
      isGetAll: "false",
    }).toString();

    return fetch(
      `https://api-restaurant-dev.phanmemviet.net.vn/warehouse/get-component?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) =>
        handleErrors(response as unknown as FetchResponse<Unit>),
      )
      .then((response) => response.json())
      .then((response) => {
        return {
          data: response.data.items,
          totalCount: response.data.total,
          summary: response.data.summary,
        };
      })
      .catch(() => {
        throw Error("Network error");
      });
  },
});

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

export const DemoGrid = () => {
  const [expanded, setExpanded] = useState(true);
  const dataGridRef = useRef<DataGridRef>(null);

  return (
    <>
      <DataGrid
        keyExpr={"id"}
        ref={dataGridRef}
        id="dataGrid"
        dataSource={customDataSource}
        columnAutoWidth
        allowColumnResizing
        allowColumnReordering
        showBorders
        showRowLines
        rowAlternationEnabled
        // columnHidingEnabled={true}
      >
        <RemoteOperations
          filtering
          // paging
          // sorting
          // summary
          groupPaging
          // grouping
        />
        <ColumnChooser enabled={true} mode="select">
          <ColumnChooserSearch
            enabled
            editorOptions={{ placeholder: "Tim ten cot" }}
          />
          <ColumnChooserSelection allowSelectAll selectByClick recursive />
        </ColumnChooser>
        <Selection mode="multiple" deferred />
        <FilterRow visible={true} showOperationChooser />
        <GroupPanel visible={true} />
        <Scrolling mode="standard" rowRenderingMode="standard" />
        <Paging enabled={true} defaultPageSize={10} />
        <Pager
          visible={true}
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
        <HeaderFilter visible={true}>
          <Search enabled={true} mode="contains" />
        </HeaderFilter>
        <SearchPanel visible={true} />
        <FilterPanel visible={true} />
        <Editing
          mode="popup"
          allowUpdating
          allowDeleting
          allowAdding
          useIcons
        />
        <Column type="buttons" width={"auto"}>
          <GridButton name="edit" />
          <GridButton name="delete" />
          <GridButton hint="clone" icon="copy" />
        </Column>
        {/* <Editing mode="form" allowUpdating allowAdding /> */}
        {/* <Editing mode="row" allowUpdating /> */}
        <Summary>
          {/* <GroupItem summaryType="count" /> */}
          <TotalItem
            column="priceBuy"
            summaryType="sum"
            valueFormat="currency"
          />
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
              onClick={() => dataGridRef?.current?.instance().state(null)}
            />
          </Item>
          <Item name="addRowButton" />
          <Item name="columnChooserButton" />
          <Item name="searchPanel" />
        </Toolbar>

        {/* <Column dataField="branchName" /> */}
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
        <ColumnFixing enabled={true} />
      </DataGrid>
    </>
  );
};
