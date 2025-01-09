"use client";

import { createQueryComponent, request } from "@/utils/custom-stores";
import DefaultButton from "devextreme-react/button";
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
  Sorting,
  StateStoring,
  Summary,
  Toolbar,
  TotalItem,
  ColumnChooserSearch,
} from "devextreme-react/data-grid";
import Form, { Item as FormItem, GroupItem } from "devextreme-react/form";
import Popup, { ToolbarItem } from "devextreme-react/popup";
import { ColumnButtonClickEvent } from "devextreme/ui/data_grid";
import { RefObject, useCallback, useMemo, useRef, useState } from "react";

import validationEngine from "devextreme/ui/validation_engine";
import notify from "devextreme/ui/notify";

const productComponentStore = createQueryComponent("/product");
const unitComponentStore = createQueryComponent("/unit");
const supplierComponentStore = createQueryComponent("/supplier");
const userComponentStore = createQueryComponent("/user");

const fetchComponent = async (url: string) => {
  const skip = 1,
    take = 1000000;

  const params = new URLSearchParams({
    id: "0",
    keySearch: "",
    pageIndex: `${Math.floor(skip / take) + 1}`,
    pageSize: `${take}`,
    isGetAll: "true",
  }).toString();

  return request(`${url}/get-component?${params}`).then((response) => {
    return {
      data: response.data.items,
      totalCount: response.data.total,
      summary: response.data.summary,
    };
  });
};

const { data: warehouseList } = await fetchComponent("/warehouse");
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

const mutatePurchase = async (data: Purchase) => {
  return request(`/purchase/${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then((response) => {
    const type = !response.data ? "error" : "success";
    notify(
      {
        message: response.message,
        width: 500,
        position: {
          // at: "bottom",
          // my: "bottom",
          // of: "#container",
        },
      },
      type,
      200,
    );
  });
};

const getById = (url: string, id: number) => {
  return request(`${url}/${id}`, { method: "GET" });
};

const supplierStore = createQueryComponent("/supplier");

const lookupSupplier = {
  store: supplierStore,
  sort: "id",
};

const getCurrentStockByMaterials = async (productId: number) => {
  return request(
    `/common/product-current-stock-get-by-product?productId=${productId}`,
    {
      method: "GET",
    },
  );
};

type WarehouseWithCurrentQuantity = {
  id: number;
  warehouseId: number;
  currentStockQuantity: number;
};
type Purchase = {
  id: number;
  cashDiscount: number;
  percentDiscount: number;
  cashVat: number;
  percentVat: number;
  totalAmountProduct: number;
  purchaseDetails: {
    id: number;
  }[];
};

type PopupState = {
  isNewRecord?: boolean;
  formData?: Purchase;
  visible?: boolean;
};

const defaultPurchase = {
  id: 0, // Khóa chính
  code: "", // Mã phiếu
  purchaseTime: new Date(), // Ngày mua
  userCreateId: null, // Nhân viên mua
  totalAmountProduct: 0, // Tổng tiền hàng
  note: "", // Ghi chú
  ids: 0, // ids
  sort: "", // sort
  numberOfCode: "", // Số phiếu
  supplierId: undefined, // Nhà cung cấp
  branchId: null, // Chi nhánh
  paymentTypeId: null, // Hình thức thanh toán
  shippingFee: 0, // Phí vận chuyển
  percentDiscount: 0, // % CK
  cashDiscount: 0, // Tiền CK
  percentVat: 0, // % VAT
  cashVat: 0, // Tiền VAT
  totalAmount: 0, // Tổng tiền sau thuế phí
  totalWeight: 0, // Tổng trọng lượng
  spentAmount: 0, // Thanh toán trên phiếu
  reductionAmount: 0, // Tiền giảm
  accountFundId: null, // Quỹ chi
  receiptsAndExpensesContentId: null, // Nội dung chi
  stockInReceiptsAndExpensesContentId: undefined, // nôi dung mua hàng
  purchaseRequestId: null, // Mã yêu cầu mua hàng
  paymentStatus: "0", // 2 Đã chi 1 Đang chi 0 Chưa chi (mặc định)
  isStockIn: true, // Kiêm nhập kho
  stockInStatus: "0", // Trạng thái nhập kho 0 chưa nhập 1 đang nhập 2 đã nhập
  spentAmountPayment: 0, // Tiền đã chi - từ phiếu chi
  deliverer: "", // Người giao hàng
  linkAttachFile: "", // Đính kèm file,
  confirmUserId: null,
  confirmDatetime: null,
  isPayment: false,
  purchaseDetails: [
    // Mua hàng chi tiết
    {
      order: 1,
      id: 0, // Khóa chính
      purchaseId: 0, // Mua hàng
      productId: 0, // Sản phẩm
      unitId: 0, // ĐVT
      unitChange: 1, // Quy đổi
      price: 0, // Giá mua
      quantity: 0, // Số lượng
      specifications: 1, // Quy cách
      percentDiscount: 0, // % CK
      cashDiscount: 0, // Tiền CK
      percentVat: 0, // % VAT
      cashVat: 0, // Tiền VAT
      totalAmount: 0, // Thành tiền
      note: "", // Diễn giải
      warehouseId: 0, // Kho hàng
      quantityPromotion: 0, // Số lượng KM
      weight: 0, // Trọng lượng
      totalWeightProduct: 0, // Tổng trọng lượng
      quantityRate: 1, // Tỷ lệ số lượng (kho thực tế)
      purchaseRequestDetailId: null, // Chi tiết yêu cầu hàng mua
      quantityStockIn: 0, // Số lượng nhập kho
    },
  ],
};

const validationGroupName = "stock-in-validation-group-name";
const getInitialFilterRangeDate = () => {
  const date = new Date();
  return [new Date(date.getFullYear(), date.getMonth(), 1), date];
};
const initialFilterRangeDate = getInitialFilterRangeDate();

const PERCENT_BASE: number = 100;

const getNumbersFromString = (numberString: string) => {
  return numberString.replace(/[^0-9]/g, "");
};

type Product = {
  id: number;
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
  unitDefault: string;
} & Record<string, unknown>;

type UnitByProduct = {
  id: number;
  priceBuy: string;
  priceSale: number;
  weight: number;
  name: string;
  typeProduct: number;
};

const getProductInfoByUnitLabel = (
  product: Product,
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

const hash = <T extends { id: number }>(
  list: T[],
  key: keyof T = "id",
): Record<number | string, T> => {
  if (!list || list.length === 0) return {} as Record<number | string, T>;
  return list.reduce(
    (acc: Record<keyof T, T>, curr) => {
      return { ...acc, [curr[key] as number]: curr };
    },
    {} as Record<keyof T, T>,
  );
};

const displayExpr =
  <T,>(showFields: (keyof T)[]) =>
  (item: T) => {
    return showFields
      .map((field) => item[field])
      .filter((i) => i !== undefined || i !== null || i !== "")
      .join(" - ");
  };

const warehouseHash = hash<WarehouseWithCurrentQuantity>(warehouseList);

const getUnitsByMaterials = (product: Product) => {
  if (!product) {
    return [];
  }

  const units = Object.keys(product).reduce(
    (result, key) => {
      if (!key.includes("unit")) {
        return result;
      }

      const unitNumber = getNumbersFromString(key);
      const unitId = product[`unit${unitNumber}Id`] as number;

      if (!unitId || !unitNumber) {
        return result;
      }

      return {
        ...result,
        [unitNumber]: getProductInfoByUnitLabel(product, `UNIT${unitNumber}`),
      };
    },
    {
      unitDefault: {
        ...getProductInfoByUnitLabel(
          product,
          product.unitDefault?.toLocaleUpperCase(),
        ),
        isDefault: true,
      },
    },
  );

  return Object.values(units);
};

export default function PurchasePage() {
  const ref = useRef<DataGridRef>(null);
  const editableDataGridRef = useRef<DataGridRef>(null);
  const [expanded, setExpanded] = useState(true);
  const currentStockByProductRef = useRef<
    Record<number, WarehouseWithCurrentQuantity>
  >({});
  const unitByProduct = useRef<Record<number, UnitByProduct[]>>({});

  const [{ isNewRecord, formData, visible }, setPopupState] =
    useState<PopupState>({
      isNewRecord: false,
      formData: JSON.parse(JSON.stringify(defaultPurchase)),
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

    if (!formData) return;

    if (isNewRecord) {
      console.log("insert new record");
    } else {
      console.log("update existed record");
      mutatePurchase(formData).then(() => hidePopup());
    }
  }, [isNewRecord, hidePopup, formData]);

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
    showPopup(true, JSON.parse(JSON.stringify(defaultPurchase)));
  }, [showPopup]);

  const onEditorPreparing = (e: DataGridTypes.EditorPreparingEvent) => {
    if (e.dataField === "warehouseId") {
      const productId = e.row?.data?.productId;
      if (productId) {
        e.editorOptions.value = e.value;
        e.editorOptions.dataSource =
          currentStockByProductRef.current[productId];
        e.editorOptions.valueExpr = "id";
      }
    }

    if (e.dataField === "unitId") {
      const productId = e.row?.data?.productId;
      if (productId) {
        e.editorOptions.value = e.value;
        e.editorOptions.dataSource = unitByProduct.current[productId];
        e.editorOptions.valueExpr = "id";
      }
    }
  };

  const onEditorPrepared = (e: DataGridTypes.EditorPreparedEvent) => {
    console.log("onEditor prepared e.dataField:", e.dataField, e.value);
  };

  const setWarehouseByProduct = (productId: number) => {
    getCurrentStockByMaterials(productId)
      .then((currentStockByProduct) => {
        if (currentStockByProduct?.data?.items?.length === 0) {
          currentStockByProductRef.current[productId] = warehouseList;
        } else {
          currentStockByProductRef.current[productId] =
            currentStockByProduct.data.items.map(
              (item: WarehouseWithCurrentQuantity) => {
                const warehouseWithCurrentQuantity = warehouseHash[
                  item.warehouseId
                ] as WarehouseWithCurrentQuantity;
                return {
                  ...warehouseWithCurrentQuantity,
                  currentStockQuantity: item.currentStockQuantity,
                };
              },
            );
        }
      })
      .catch((error) => console.error("error:", error));
  };

  const setUnitsByProduct = (product: Product) => {
    unitByProduct.current[product.id] = getUnitsByMaterials(
      product,
    ) as UnitByProduct[];
  };

  const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {
    if (e.rowType === "data" && e.column.dataField === "productId") {
      const productId = e.value;
      if (productId) {
        /// get entity product information
        productComponentStore.byKey(e.value).then((response) => {
          const product = response.data;
          const infoByUnit = getProductInfoByUnitLabel(product);
          if (e?.row?.data && infoByUnit) {
            e.data.unitId = infoByUnit.id;
            e.data.priceBuy = infoByUnit.priceBuy;
            e.data.unitChange = infoByUnit.unitChange;
          }

          if (unitByProduct.current[productId] === undefined) {
            setUnitsByProduct(product);
          }
        });
        // get current stock by product
        if (currentStockByProductRef.current[productId] === undefined) {
          setWarehouseByProduct(productId);
        }
      }
    }

    if (e.column.dataField === "quantity" || e.column.dataField === "price") {
      const newValue = e.value;
      if (e.data) {
        const price =
          e.column.dataField === "quantity" ? newValue : e.data.price || 0;
        const quantity =
          e.column.dataField === "price" ? newValue : e.data.quantity || 0;
        e.data.totalAmount = price * quantity;
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
      {/* <Selection mode="multiple" deferred /> */}
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
        storageKey="purchase-page-client-data-grid"
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
      <Column
        dataField="order"
        caption="STT"
        dataType="number"
        format={",##0,##"}
        alignment="right"
        cellRender={(cellData) => cellData.rowIndex + 1}
      />
      <Column dataField="purchaseTime" caption="Ngay lap" dataType="date" />
      <Column dataField="code" caption="Ma phieu" />
      <Column dataField="numberOfCode" caption="So phieu" />
      <Column dataField="supplierId" caption="Nha cung cap">
        <Lookup
          dataSource={lookupSupplier}
          displayExpr={displayExpr(["code", "name"])}
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
          <Form
            validationGroup={validationGroupName}
            onFieldDataChanged={(e) => {
              if (!formData) return;
              const { cashDiscount, percentVat, totalAmountProduct } = formData;
              const newFormData = {
                ...formData,
                [e.dataField as string]: e.value,
              };
              const { dataField, value } = e;

              const fieldWithSideEffect = [
                "cashDiscount",
                "percentDiscount",
                "cashVat",
                "percentVat",
              ];

              if (!fieldWithSideEffect.includes(dataField + "")) {
                return;
              }

              //
              if (dataField === "cashDiscount") {
                newFormData.percentDiscount =
                  (value * PERCENT_BASE) / Number(totalAmountProduct);
                newFormData.cashVat =
                  (Number(percentVat) *
                    Number(totalAmountProduct - cashDiscount)) /
                  PERCENT_BASE;
              }

              //
              else if (dataField === "percentDiscount") {
                newFormData.cashDiscount =
                  (value * totalAmountProduct) / PERCENT_BASE;
                newFormData.cashVat =
                  (percentVat * (totalAmountProduct - cashDiscount)) /
                  PERCENT_BASE;
              }

              //
              else if (dataField === "cashVat") {
                newFormData.percentVat =
                  (value * PERCENT_BASE) / (totalAmountProduct - cashDiscount);
              }

              //
              else if (dataField === "percentVat") {
                newFormData.cashVat =
                  ((totalAmountProduct - cashDiscount) * percentVat) /
                  PERCENT_BASE;
              }

              setPopupState((prev) => {
                return { ...prev, formData: newFormData };
              });
            }}
            formData={formData}
          >
            <GroupItem colCount={3}>
              <FormItem
                colSpan={2}
                dataField="supplierId"
                editorType="dxSelectBox"
                label={{
                  text: "Nha cung cap",
                }}
                editorOptions={{
                  dataSource: supplierComponentStore,
                  valueExpr: "id",
                  displayExpr: (item: { code: string; name: string }) => {
                    if (!item) return "";
                    let str = "";
                    if (item.code) str += item.code;
                    if (item.name) str += ` - ${item.name}`;

                    return str;
                  },
                  searchEnable: true,
                }}
              />
              <FormItem
                dataField="purchaseTime"
                label={{ text: "Ngay lap" }}
                editorType="dxDateBox"
              />
              <FormItem
                colSpan={2}
                label={{ text: "Nguoi giao" }}
                dataField="deliverer"
              />
              <FormItem
                dataField="code"
                label={{ text: "Ma phieu" }}
                disabled={true}
              />
              <FormItem
                colSpan={2}
                label={{ text: "Ghi chu" }}
                dataField="note"
                editorType="dxTextArea"
                editorOptions={{
                  height: 90,
                  maxLength: 200,
                }}
              />
              <FormItem dataField="numberOfCode" label={{ text: "So phieu" }} />
              <FormItem
                colSpan={2}
                label={{ text: "Kiem nhap kho" }}
                dataField="isStockIn"
                editorType="dxCheckBox"
                editorOptions={{
                  iconSize: "25",
                }}
              />
              <FormItem
                dataField="userCreate"
                editorType="dxSelectBox"
                label={{ text: "Nguoi lap" }}
                editorOptions={{
                  dataSource: userComponentStore,
                  valueExpr: "id",
                  displayExpr: displayExpr(["userName", "name"]),
                }}
              />
            </GroupItem>
            <GroupItem>
              <DataGrid
                ref={editableDataGridRef}
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
                onEditorPrepared={onEditorPrepared}
                onCellPrepared={onCellPrepared}
                onInitNewRow={(e) => {
                  const length = editableDataGridRef.current
                    ?.instance()
                    .getDataSource()
                    .items().length;

                  const newRow = {
                    ...defaultPurchase.purchaseDetails[0],
                    order: (length || 1) + 1,
                    id: Date.now(),
                  };
                  e.data = newRow;
                }}
              >
                <ColumnChooser enabled mode="select">
                  <ColumnChooserSearch enabled />
                  <ColumnChooserSelection
                    allowSelectAll
                    selectByClick
                    recursive
                  />
                </ColumnChooser>
                <Editing
                  mode="cell"
                  allowUpdating={true}
                  allowAdding={true}
                  allowDeleting={true}
                  confirmDelete={false}
                />
                <Sorting mode="single" key={"order"} />
                <Scrolling mode="standard" showScrollbar="onHover" />
                <StateStoring
                  enabled
                  type="localStorage"
                  storageKey="purchase-editable-data-grid"
                />
                <Column
                  dataField="order"
                  caption="STT"
                  format={"#,##0.##"}
                  sortOrder="asc"
                  allowSorting
                  allowEditing={false}
                />
                <Column dataField="productId" caption="Nguyên vật liệu">
                  <Lookup
                    dataSource={productComponentStore}
                    valueExpr={"id"}
                    displayExpr={displayExpr(["code", "name"])}
                  />
                </Column>
                <Column dataField="unitId" caption="Đơn vị tính">
                  <Lookup
                    dataSource={unitComponentStore}
                    valueExpr={"id"}
                    displayExpr={displayExpr(["code", "name"])}
                  />
                </Column>
                <Column
                  dataField="unitChange"
                  caption="Quy đổi"
                  dataType="number"
                  alignment="right"
                  format=",##0,##"
                />
                <Column dataField="note" caption="Ghi chu" />
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
                  allowEditing={false}
                />
                <Column dataField="warehouseId" caption="Kho">
                  <Lookup
                    dataSource={[]}
                    valueExpr={"id"}
                    displayExpr={displayExpr([
                      "code",
                      "name",
                      "currentStockQuantity",
                    ])}
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
            <GroupItem colCount={4}>
              <FormItem
                dataField="totalAmountProduct"
                label={{ text: "Tong thanh tien" }}
                editorType="dxNumberBox"
                editorOptions={{
                  format: ",##0.##",
                  showSpinButtons: true,
                  showClearButton: true,
                }}
              />
              <FormItem
                dataField="percentDiscount"
                label={{ text: "% CK" }}
                editorType="dxNumberBox"
                editorOptions={{
                  format: ",##0.##",
                }}
              />
              <FormItem
                dataField="cashDiscount"
                label={{ text: "Tien CK" }}
                editorType="dxNumberBox"
                editorOptions={{
                  format: ",##0.##",
                }}
              />
              <FormItem
                dataField="totalAmount"
                label={{ text: "Tong cong" }}
                editorType="dxNumberBox"
                editorOptions={{
                  format: ",##0.##",
                }}
              />
            </GroupItem>
          </Form>
        </Popup>
      )}
    </DataGrid>
  );
}
