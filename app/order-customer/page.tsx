"use client";

import { createPaginationFiltersStore } from "@/utils/custom-stores";
import AddRowButton from "devextreme-react/button";
import {
  Button,
  Column,
  DataGridRef,
  Toolbar,
} from "devextreme-react/data-grid";
import Form, { GroupItem, Item, Label } from "devextreme-react/form";
import Popup, { ToolbarItem } from "devextreme-react/popup";
import { ColumnButtonClickEvent } from "devextreme/ui/data_grid";
import { useCallback, useMemo, useRef, useState } from "react";
import { DefaultDataGrid } from "../components/lib/default-data-grid";
import { Tooltip } from "devextreme-react/tooltip";
import validationEngine from "devextreme/ui/validation_engine";

const orderCustomerStore = createPaginationFiltersStore(
  "/order-customer/get-all",
  "id",
);

const LabelTemplate = (iconName: string) => {
  const Label = (data: { text: string }) => {
    console.log("data:", data);
    return (
      <div>
        <i className={`dx-icon dx-icon-${iconName}`} />
        {data.text}
      </div>
    );
  };
  return Label;
};

const LabelNotesTemplate = (data: { text: string }) => {
  return (
    <>
      <div id="template-content">
        <i id="helpedInfo" className="dx-icon dx-icon-info"></i>
        Additional {data.text}
      </div>
      <Tooltip
        target="#helpedInfo"
        showEvent="mouseenter"
        hideEvent="mouseleave"
      >
        <div id="tooltip-content">This field mus not exceed 200 characters</div>
      </Tooltip>
    </>
  );
};

const validationRules = {
  firstName: [{ type: "required", message: "First Name is required." }],
  lastName: [{ type: "required", message: "Last Name is required." }],
  phone: [{ type: "required", message: "Phone number is required." }],
  email: [{ type: "email", message: "Email is incorrect." }],
  birthDate: [
    {
      type: "required",
      message: "Birth Date is required.",
      invalidDateMessage: "The date must have the following format: mm/dd/yyyy",
    },
  ],
};

const notesEditorOptions = { height: 90, maxLength: 200 };
const phoneEditorOptions = {
  mask: "+1 (X00) 000-0000",
  maskRules: { X: /[02-9]/ },
  maskInvalidMessage: "The phone must have a correct USA phone format",
};

type PopupState = {
  isNewRecord?: boolean;
  formData?: Record<string, unknown>;
  visible?: boolean;
};

const validationGroupName = "GridForm";

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

    if (isNewRecord) {
      console.log("insert new record");
    } else {
      console.log("update existed record");
    }

    gridRef?.current?.instance()?._refresh();
    hidePopup();
  }, [hidePopup, isNewRecord]);

  const confirmBtnOptions = useMemo(() => {
    return { text: "Confirm", type: "success", onClick: confirmChanges };
  }, [confirmChanges]);

  const cancelBtnOptions = useMemo(() => {
    return { text: "Cancel", onClick: hidePopup };
  }, [hidePopup]);

  const editRow = useCallback(
    (e: ColumnButtonClickEvent) => {
      showPopup(false, { ...e?.row?.data });
    },
    [showPopup],
  );

  const addRow = useCallback(() => {
    showPopup(true, {});
  }, [showPopup]);

  return (
    <DefaultDataGrid
      dataSource={orderCustomerStore}
      keyExpr={"id"}
      ref={gridRef}
    >
      <Column dataField="code" caption="Ma Phieu" />
      <Column dataField="name" caption="Ten" />
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
              <Item
                dataField="FirstName"
                validationRules={[
                  {
                    type: "required",
                    message: "First Name is required",
                  },
                ]}
              >
                <Label render={LabelTemplate("FirstName")} />
              </Item>
              <Item dataField="Position" editorType="dxSelectBox">
                <Label render={LabelTemplate("info")} />
              </Item>
              <Item
                dataField="LastName"
                validationRules={validationRules.lastName}
              >
                <Label render={LabelTemplate("user")} />
              </Item>
              <Item dataField="Address">
                <Label render={LabelTemplate("home")} />
              </Item>
              <Item
                dataField="BirthDate"
                editorType="dxDateBox"
                validationRules={validationRules.birthDate}
              >
                <Label render={LabelTemplate("event")} />
              </Item>
              <Item
                dataField="HireDate"
                editorOptions={{ label: "Ngay thue" }}
                editorType="dxDateBox"
              >
                <Label render={LabelTemplate("event")} />
              </Item>
              <Item
                dataField="Notes"
                colSpan={2}
                editorType="dxTextArea"
                editorOptions={notesEditorOptions}
              >
                <Label render={LabelNotesTemplate} />
              </Item>
              <Item
                dataField="Phone"
                editorOptions={phoneEditorOptions}
                validationRules={validationRules.phone}
              >
                <Label render={LabelTemplate("tel")} />
              </Item>
              <Item dataField="Email" validationRules={validationRules.email}>
                <Label render={LabelTemplate("email")} />
              </Item>
            </GroupItem>
          </Form>
        </Popup>
      )}
    </DefaultDataGrid>
  );
}
