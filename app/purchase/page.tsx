"use client";

import { createQueryComponent, request } from "@/utils/custom-stores";
import DefaultButton from "devextreme-react/button";
import { ColumnChooserSearch } from "devextreme-react/cjs/tree-list";
import DataGrid, {
  Button,
  Column,
  ColumnChooser,
  ColumnChooserSelection,
  ColumnFixing,
  DataGridRef,
  DataGridTypes,
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
import Form, { Item as FormItem, GroupItem } from "devextreme-react/form";
import Popup, { ToolbarItem } from "devextreme-react/popup";
import { ColumnButtonClickEvent } from "devextreme/ui/data_grid";
import { RefObject, useCallback, useMemo, useRef, useState } from "react";

import validationEngine from "devextreme/ui/validation_engine";

const productComponentStore = createQueryComponent("/product");
const unitComponentStore = createQueryComponent("/unit");
const warehouseComponentStore = createQueryComponent("/warehouse");

type PopupState = {
  isNewRecord?: boolean;
  formData?: Record<string, unknown>;
  visible?: boolean;
};

const validationGroupName = "stock-in-validation-group-name";

const getNumbersFromString = (numberString: string) => {
  return numberString.replace(/[^0-9]/g, "");
};

const getProductInfoByUnitLabel = (
  product: {
    priceBuy: number;
    priceBuy1: number;
    priceBuy2: number;
    priceSale: number;
    priceSale1: number;
    priceSale2: number;
    unitId: number;
    unit1Id: number;
    unit2Id: number;
    unitName: number;
    unit1Name: number;
    unit2Name: number;
    weight: number;
    weight1: number;
    weight2: number;
  } & Record<string, unknown>,
  unitLabel: string = "UNIT",
) => {
  if (!product) return;

  const unitNumber = getNumbersFromString(unitLabel);
  return {
    productId: product.id,
    typeProduct: product.productType,
    id: product[`unit${unitNumber}Id`],
    name: product[`unit${unitNumber}Name`],
    unitChange: product[`unitChange${unitNumber}`],
    priceBuy: product[`priceBuy${unitNumber}`],
    priceSale: product[`priceSale${unitNumber}`],
    weight: product[`weight${unitNumber}`],
  };
};

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

const getById = (url: string, id: number) => {
  return request(`${url}/${id}`, { method: "GET" });
};

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

  const [{ isNewRecord, formData, visible }, setPopupState] =
    useState<PopupState>({
      isNewRecord: false,
      formData: {},
      visible: false,
    });

  const showPopup = useCallback(
    (isNewRecord: boolean, formData: PopupState["formData"]) => {
      setPopupState({ isNewRecord, formData, visible: true });
    },
    [],
  );

  const hidePopup = useCallback(() => {
    setPopupState({ visible: false });
  }, []);

  const confirmChanges = useCallback(() => {
    const result = validationEngine.validateGroup(validationGroupName);
    if (!result.isValid) {
      return;
    }

    // console.log("formData:", formData);

    if (isNewRecord) {
      console.log("insert new record");
    } else {
      console.log("update existed record");
    }

    // gridRef?.current?.instance()?._refresh();
    // hidePopup();
  }, [isNewRecord]);

  const confirmBtnOptions = useMemo(() => {
    return { text: "Confirm", type: "success", onClick: confirmChanges };
  }, [confirmChanges]);

  const cancelBtnOptions = useMemo(() => {
    return { text: "Cancel", onClick: hidePopup };
  }, [hidePopup]);

  const editRow = useCallback(
    (e: ColumnButtonClickEvent) => {
      getById("/purchase", e?.row?.data?.id).then((response) => {
        showPopup(false, response.data);
      });
    },
    [showPopup],
  );

  const addRow = useCallback(() => {
    showPopup(true, {
      purchaseDetails: [{ id: Math.random() }],
    });
  }, [showPopup]);

  const onEditorPreparing = (e: DataGridTypes.EditorPreparingEvent) => {
    if (e.dataField === "productId") {
      const productId = e.value;
      if (productId) {
        productComponentStore.byKey(e.value).then((response) => {
          const product = response.data;
          const infoByUnit = getProductInfoByUnitLabel(product);
          if (e?.row?.data && infoByUnit) {
            e.row.data.unitId = infoByUnit.id;
            e.row.data.priceBuy = infoByUnit.priceBuy;
            e.row.data.unitChange = infoByUnit.unitChange;
          }
        });
      }
    }

    if (e.dataField === "quantity" || e.dataField === "price") {
      const newValue = e.value;
      // Calculate totalAmount dynamically
      if (e.row && e.row.data) {
        const rowData = e.row.data;

        // Update totalAmount based on the new value
        const price = e.dataField === "price" ? newValue : rowData.price || 0;
        const quantity =
          e.dataField === "price" ? newValue : rowData.quantity || 0;

        rowData.totalAmount = price * quantity;

        // Refresh the grid for immediate effect (optional but recommended)
        // e.component.refresh();
      }
    }
  };

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
          <DefaultButton
            type="normal"
            text="Reset"
            onClick={() =>
              (ref as RefObject<DataGridRef>)?.current?.instance().state(null)
            }
          />
        </Item>
        <Item location="after">
          <DefaultButton
            text={expanded ? "Collapse All" : "Expand All"}
            width={135}
            onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
          />
        </Item>
        <Item>
          <DefaultButton icon="plus" onClick={addRow} />
        </Item>
        <Item name="columnChooserButton" />
        <Item name="searchPanel" />
      </Toolbar>
      <Selection mode="multiple" deferred />
      <Sorting mode="multiple" />
      <FilterRow visible showOperationChooser />
      <Scrolling mode="standard" rowRenderingMode="standard" />
      <Paging enabled defaultPageSize={10} />
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
        // allowedPageSizes={[5, 10, 50, 100, "all"]}
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
      <Column type="buttons">
        <Button name="edit" onClick={editRow} />
        <Button name="delete" />
      </Column>
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
      {visible && (
        <Popup
          title={isNewRecord ? "Add" : "Edit"}
          hideOnOutsideClick={true}
          visible={true}
          height="70vh"
          onHiding={hidePopup}
        >
          <ToolbarItem
            widget="dxButton"
            location="after"
            toolbar="bottom"
            options={confirmBtnOptions}
          />
          <ToolbarItem
            widget="dxButton"
            location="after"
            toolbar="bottom"
            options={cancelBtnOptions}
          />
          <Form validationGroup={validationGroupName} formData={formData}>
            <GroupItem colCount={2}>
              <FormItem dataField="userCreateId" />
              <FormItem dataField="code" />
              <FormItem dataField="deliverer" />
              <FormItem dataField="purchaseTime" />
              <FormItem dataField="note" />
              <FormItem dataField="receiptsAndExpensesContentId" />
            </GroupItem>
            <GroupItem>
              <DataGrid
                keyExpr={"id"}
                id="purchase-editable-data-grid"
                columnAutoWidth
                allowColumnResizing
                allowColumnReordering
                showBorders
                showRowLines
                rowAlternationEnabled
                dataSource={formData?.purchaseDetails ?? []}
                onEditorPreparing={onEditorPreparing}
              >
                <Editing
                  mode="cell"
                  allowUpdating={true}
                  allowAdding={true}
                  allowDeleting={true}
                  confirmDelete={false}
                />
                <Column dataField="productId" caption="Nguyên vật liệu">
                  <Lookup
                    dataSource={productComponentStore}
                    valueExpr={"id"}
                    displayExpr={(item) =>
                      `${item.barCode} ${item.code} ${item.name}`
                    }
                  />
                </Column>
                <Column dataField="unitId" caption="Đơn vị tính">
                  <Lookup
                    dataSource={unitComponentStore}
                    valueExpr={"id"}
                    displayExpr={(item) => `${item.code} ${item.name}`}
                  />
                </Column>
                <Column dataField="unitChange" caption="Quy đổi" />
                <Column
                  dataField="quantityPromotion"
                  caption="SL KM"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="quantity"
                  caption="SL"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="price"
                  caption="Đơn giá"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="specifications"
                  caption="Quy cach"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="percentDiscount"
                  caption="% KM"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="cashDiscount"
                  caption="KM"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="percentVat"
                  caption="% Vat"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="cashVat"
                  caption="Phi Vat"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="totalAmount"
                  caption="Thành tiền"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column dataField="warehouseId" caption="Kho">
                  <Lookup
                    dataSource={warehouseComponentStore}
                    valueExpr={"id"}
                    displayExpr={(item) => `${item.code} ${item.name}`}
                  />
                </Column>

                <Column
                  dataField="weight"
                  caption="Trong luong"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="totalWeightProduct"
                  caption="Tong trong luong"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="quantityRate"
                  caption="Ti le hao hut"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column
                  dataField="quantityStockIn"
                  caption="So luong nhap kho"
                  dataType="number"
                  alignment="right"
                  format=",##0.##"
                />
                <Column type="buttons" fixed fixedPosition="right">
                  <Button name="delete" />
                </Column>
              </DataGrid>
            </GroupItem>
          </Form>
        </Popup>
      )}
    </DataGrid>
  );
}
