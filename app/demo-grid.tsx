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
} from "devextreme-react/data-grid";
import CustomStore from "devextreme/data/custom_store";
import { useState } from "react";

type Unit = {
  code: string;
  name: string;
};

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

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmltYXJ5c2lkIjoiNTkiLCJ1bmlxdWVfbmFtZSI6ImFkbWluIiwiZ3JvdXBzaWQiOiIxMiIsIkludm9pY2VDb25maWdJZCI6IjAiLCJCcmFuY2hJZHMiOiIiLCJTdGFmZklkIjoiMzMiLCJXYXJlaG91c2VJZHMiOiIiLCJVc2VyQ2FzaGllcklkcyI6IjIwMCw1OSIsIlBheW1lbnRUeXBlSWQiOiIyIiwibmJmIjoxNzMzNzM3MzUxLCJleHAiOjE3MzYzMjkzNTEsImlhdCI6MTczMzczNzM1MX0.Zo-Hu5CRQjEMzb-5S-0R7LPgzjZFFlzeCHl3DmqsBLI";

const customDataSource = new CustomStore({
  // key: "id",
  load: async (loadOptions) => {
    console.log("loadOptions:", loadOptions);
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
          filterColumn: [
            {
              column: "string",
              keySearch: "string",
              expression: "string",
            },
          ],
          pageIndex: 1,
          pageSize: 100,
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
        console.log("response:", response);
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

export const DemoGrid = () => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="app">
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
          paging
          // sorting
          // summary
          // grouping
          // groupPaging
        />
        <ColumnChooser enabled={true} mode="select" />
        <Selection
          mode="multiple"
          selectAllMode="allPages"
          showCheckBoxesMode="always"
        />
        <FilterRow visible={true} showOperationChooser />
        <Scrolling mode="standard" rowRenderingMode="standard" />
        <Paging defaultPageSize={10} />
        <Pager
          visible={true}
          showInfo
          showNavigationButtons
          showPageSizeSelector
          displayMode="adaptive"
          allowedPageSizes={"auto"}
        />
        <HeaderFilter visible={true}>
          <Search enabled={true} />
        </HeaderFilter>
        <SearchPanel visible={true} />
        <Column dataField="creatorName" dataType="string" />
        <Column dataField="updaterName" dataType="string" />
        <Column dataField="isActive" dataType="boolean" />
        <Column dataField="code" dataType="string" />
        <Column dataField="name" dataType="string" />
        <Column dataField="note" dataType="string" />
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
    </div>
  );
};
