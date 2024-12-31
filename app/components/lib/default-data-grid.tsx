import { Button } from "devextreme-react";
import DataGrid, {
  ColumnChooser,
  ColumnChooserSearch,
  ColumnChooserSelection,
  ColumnFixing,
  DataGridRef,
  Editing,
  FilterPanel,
  FilterRow,
  Grouping,
  HeaderFilter,
  Item,
  Pager,
  Paging,
  RemoteOperations,
  Scrolling,
  Search,
  SearchPanel,
  Selection,
  StateStoring,
  Summary,
  Toolbar,
  TotalItem,
} from "devextreme-react/data-grid";
import React, { RefObject, useState } from "react";

export function DefaultDataGrid({
  children,
  ref,
  ...props
}: React.PropsWithChildren & React.ComponentProps<typeof DataGrid>) {
  const { remoteOperations, ...gridProps } = props;
  const [expanded, setExpanded] = useState(true);

  return (
    <DataGrid
      keyExpr={"id"}
      ref={ref}
      id="dataGrid"
      columnAutoWidth
      allowColumnResizing
      allowColumnReordering
      showBorders
      showRowLines
      rowAlternationEnabled
      {...gridProps}
    >
      <RemoteOperations
        filtering
        // paging
        // sorting
        // summary
        groupPaging
        // grouping
        {...(remoteOperations as object)}
      />
      <ColumnChooser enabled mode="select">
        <ColumnChooserSearch enabled />
        <ColumnChooserSelection allowSelectAll selectByClick recursive />
      </ColumnChooser>
      <Selection mode="multiple" deferred />
      <FilterRow visible showOperationChooser />
      <Scrolling mode="standard" rowRenderingMode="standard" />
      <Paging enabled defaultPageSize={10} />
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
      <Editing mode="popup" allowUpdating allowDeleting allowAdding useIcons />
      {/* <Column type="buttons" width={"auto"}> */}
      {/*   <GridButton name="edit" /> */}
      {/*   <GridButton name="delete" /> */}
      {/*   <GridButton hint="clone" icon="copy" /> */}
      {/* </Column> */}
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
      {children}
    </DataGrid>
  );
}
