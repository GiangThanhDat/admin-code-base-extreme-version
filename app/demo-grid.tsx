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
  GroupItem,
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
} from "devextreme-react/data-grid";
import { FilterDescriptor } from "devextreme/data";
import CustomStore from "devextreme/data/custom_store";
import { useState } from "react";

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

const createFilterColumn = (filter: FilterDescriptor | FilterDescriptor[]) => {
  const map: Record<
    string,
    { column: string; expression: string; keySearch: string[] }
  > = {};
  if (!filter) return [];

  if (!Array.isArray(filter[0])) {
    const [column, expression, keySearch] = filter;
    return [
      {
        column: capitalizeFirstLetter(column),
        expression,
        keySearch: keySearch.toString(),
      },
    ];
  }

  const queue = [...filter];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (typeof item[0] === "string" && !["a", "o"].includes(item[0])) {
      const [column, expression, keySearch] = item;

      if (!keySearch) continue;

      if (!map[column]) {
        map[column] = {
          column: capitalizeFirstLetter(column),
          expression: expression === "=" ? "IN" : expression,
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
};

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmltYXJ5c2lkIjoiNTkiLCJ1bmlxdWVfbmFtZSI6ImFkbWluIiwiZ3JvdXBzaWQiOiIxMiIsIkludm9pY2VDb25maWdJZCI6IjAiLCJCcmFuY2hJZHMiOiIiLCJTdGFmZklkIjoiMzMiLCJXYXJlaG91c2VJZHMiOiIiLCJVc2VyQ2FzaGllcklkcyI6IjIwMCw1OSIsIlBheW1lbnRUeXBlSWQiOiIyIiwibmJmIjoxNzMzNzM3MzUxLCJleHAiOjE3MzYzMjkzNTEsImlhdCI6MTczMzczNzM1MX0.Zo-Hu5CRQjEMzb-5S-0R7LPgzjZFFlzeCHl3DmqsBLI";

const customDataSource = new CustomStore({
  // key: "id",
  load: async (loadOptions) => {
    // console.log("loadOptions:", loadOptions);
    const { skip = 0, take = 1, filter } = loadOptions;

    // Con vu ['!', [array]] chua xu ly duoc
    console.log("filter:", filter);
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
      isGetAll: "false",
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
      pageSiez: `${take}`,
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
  return (
    <DataGrid
      id="dataGrid"
      dataSource={customDataSource}
      columnAutoWidth
      allowColumnResizing
      allowColumnReordering
      showBorders
      showRowLines
    >
      <RemoteOperations
        filtering
        // paging
        // sorting
        // summary
        // grouping
        groupPaging
      />
      <ColumnChooser enabled={true} mode="select" />
      <Selection
        mode="multiple"
        selectAllMode="allPages"
        showCheckBoxesMode="always"
      />
      <FilterRow visible={true} showOperationChooser />
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
      <HeaderFilter visible={true}>
        <Search enabled={true} mode="contains" />
      </HeaderFilter>
      <SearchPanel visible={true} />
      <FilterPanel visible={true} />
      {/* <Column dataField="branchName" /> */}
      <Column dataField="code" caption="Ma hang hoa" />
      <Column dataField="note" caption="Ghi chu" />
      <Column dataField="name" caption="Ten hang hoa" />
      <Column dataField="priceBuy" dataType="number" caption="Gia mua" />
      <Column dataField="priceBuy1" dataType="number" caption="Gia mua 1" />
      <Column dataField="priceBuy2" dataType="number" caption="Gia mua 2" />
      <Column dataField="priceSale" dataType="number" caption="Gia ban" />
      <Column dataField="priceSale1" dataType="number" caption="Gia ban 1" />
      <Column dataField="priceSale2" dataType="number" caption="Gia ban 2" />
      <Column
        dataField="unitId"
        dataType="string"
        cellRender={(props) => <>{props.data.unitName}</>}
        caption="Don vi tinh"
      >
        <HeaderFilter dataSource={unitHeaderFilterSource} />
      </Column>
      <Column dataField="unit1Name" caption="Don vi tinh 1">
        <HeaderFilter dataSource={unitHeaderFilterSource} />
      </Column>
      <Column dataField="unit2Name" caption="Don vi tinh 2">
        <HeaderFilter dataSource={unitHeaderFilterSource} />
      </Column>
      <Column dataField="warehouseName" caption="Kho hang">
        <HeaderFilter dataSource={warehouseHeaderFilterSource} />
      </Column>
      <Column dataField="weight" dataType="number" caption="Khoi luong" />
      <Column dataField="weight1" dataType="number" caption="Khoi luong 1" />
      <Column dataField="weight2" dataType="number" caption="Khoi luong 2" />
      <Column dataField="img" caption="Thumb" />
      <ColumnFixing enabled={true} />
      <Editing
        mode="popup"
        allowUpdating={true}
        allowDeleting={true}
        allowAdding={true}
      />
      {/* <Editing mode="form" allowUpdating allowAdding /> */}
      {/* <Editing mode="row" allowUpdating /> */}
      <Summary>
        <GroupItem summaryType="count" />
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
        <Item name="addRowButton" />
        <Item name="columnChooserButton" />
        <Item name="searchPanel" />
      </Toolbar>
    </DataGrid>
  );
};
