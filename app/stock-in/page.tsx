"use client";

import {
  createPaginationFiltersStore,
  createQueryComponent,
} from "@/utils/custom-stores";
import AddRowButton from "devextreme-react/button";
import DataGrid, {
  Button,
  Column,
  DataGridRef,
  DataGridTypes,
  Editing,
  Lookup,
  Toolbar,
} from "devextreme-react/data-grid";
import Form, { GroupItem, Item } from "devextreme-react/form";
import Popup, { ToolbarItem } from "devextreme-react/popup";
import { ColumnButtonClickEvent } from "devextreme/ui/data_grid";
import validationEngine from "devextreme/ui/validation_engine";
import { useCallback, useMemo, useRef, useState } from "react";
import { DefaultDataGrid } from "../components/lib/default-data-grid";

const stockInStore = createPaginationFiltersStore("/stock-in", "id");
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

export default function OrderCustomerPage() {
  const gridRef = useRef<DataGridRef>(null);
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
  }, [hidePopup, isNewRecord, formData]);

  const confirmBtnOptions = useMemo(() => {
    return { text: "Confirm", type: "success", onClick: confirmChanges };
  }, [confirmChanges]);

  const cancelBtnOptions = useMemo(() => {
    return { text: "Cancel", onClick: hidePopup };
  }, [hidePopup]);

  const editRow = useCallback(
    (e: ColumnButtonClickEvent) => {
      stockInStore.byKey(e?.row?.data?.id).then((response) => {
        showPopup(false, response.data);
      });
    },
    [showPopup],
  );

  const addRow = useCallback(() => {
    showPopup(true, {
      stockInDetails: [{ id: Math.random() }],
    });
  }, [showPopup]);

  const onEditorPreparing = (e: DataGridTypes.EditorPreparingEvent) => {
    if (e.dataField === "productId") {
      productComponentStore.byKey(e.value).then((response) => {
        // console.log("response:", response);
        const product = response.data;
        const infoByUnit = getProductInfoByUnitLabel(product);
        if (e?.row?.data) {
          // console.log("infoByUnit:", infoByUnit);
          e.row.data.unitId = infoByUnit.id;
          e.row.data.priceBuy = infoByUnit.priceBuy;
          e.row.data.unitChange = infoByUnit.unitChange;
        }
      });
    }

    if (e.dataField === "quantity" || e.dataField === "priceBuy") {
      const newValue = e.value;
      // Calculate totalAmount dynamically
      if (e.row && e.row.data) {
        const rowData = e.row.data;

        // Update totalAmount based on the new value
        const priceBuy =
          e.dataField === "priceBuy" ? newValue : rowData.priceBuy || 0;
        const quantity =
          e.dataField === "quantity" ? newValue : rowData.quantity || 0;

        rowData.totalAmount = priceBuy * quantity;

        // Refresh the grid for immediate effect (optional but recommended)
        // e.component.refresh();
      }
    }
  };

  return (
    <DefaultDataGrid dataSource={stockInStore} keyExpr={"id"} ref={gridRef}>
      <Column dataField="stockInTime" caption="Ngày lập" />
      <Column dataField="code" caption="Mã phiếu" />
      <Column
        dataField="receiptsAndExpensesContentId"
        caption="Nội dung thu chi"
      />
      <Column dataField="useCreateId" caption="Nhân viên lập" />
      <Column dataField="numberOfCode" caption="Số phiếu" />
      <Column dataField="note" caption="Ghi chú" />
      <Column type="buttons">
        <Button name="edit" onClick={editRow} />
        <Button name="delete" />
      </Column>
      <Toolbar>
        <Item>
          <AddRowButton icon="plus" onClick={addRow} />
        </Item>
      </Toolbar>
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
              <Item dataField="userCreateId" />
              <Item dataField="code" />
              <Item dataField="deliverer" />
              <Item dataField="stockInTime" />
              <Item dataField="note" />
              <Item dataField="receiptsAndExpensesContentId" />
            </GroupItem>
            <GroupItem>
              <DataGrid
                dataSource={formData.stockInDetails}
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
                <Column dataField="quantity" caption="SL" />
                <Column dataField="unitChange" caption="Quy đổi" />
                <Column dataField="priceBuy" caption="Đơn giá" />
                <Column dataField="totalAmount" caption="Thành tiền" />
                <Column dataField="warehouseId" caption="Kho">
                  <Lookup
                    dataSource={warehouseComponentStore}
                    valueExpr={"id"}
                    displayExpr={(item) => `${item.code} ${item.name}`}
                  />
                </Column>
              </DataGrid>
            </GroupItem>
          </Form>
        </Popup>
      )}
    </DefaultDataGrid>
  );
}
