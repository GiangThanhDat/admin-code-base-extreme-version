import DataGrid, {
  Column,
  Paging,
  Scrolling,
  Selection,
  DataGridTypes,
} from "devextreme-react/data-grid";
import { useCallback, useState } from "react";

import DropDownBox, { DropDownBoxTypes } from "devextreme-react/drop-down-box";

export const DropdownLookup = (props) => {
  const {
    data: { value: dataValue },
  } = props;

  const initialSelectedRowKeys =
    dataValue !== null && dataValue !== undefined ? [dataValue] : [];

  const [selectedRowKeys, setSelectedRowKeys] = useState(
    initialSelectedRowKeys,
  );

  const [isDropDownOpened, setDropDownOpened] = useState(false);

  const boxOptionChanged = useCallback(
    (e: DropDownBoxTypes.OptionChangedEvent) => {
      if (e.name === "opened") {
        setDropDownOpened(e.value);
      }
    },
    [],
  );

  const contentRender = useCallback(() => {
    const onSelectionChanged = (args: DataGridTypes.SelectionChangedEvent) => {
      setSelectedRowKeys(args.selectedRowKeys);
      setDropDownOpened(false);
      props.data.setValue(args.selectedRowKeys[0]);
    };

    return (
      <DataGrid
        dataSource={props.data.column.lookup.dataSource}
        remoteOperations={true}
        height={250}
        selectedRowKeys={selectedRowKeys}
        hoverStateEnabled={true}
        onSelectionChanged={onSelectionChanged}
        focusedRowEnabled={true}
        defaultFocusedRowKey={selectedRowKeys[0]}
      >
        <Column dataField="barCode" />
        <Column dataField="code" />
        <Column dataField="name" />
        <Paging enabled={true} defaultPageSize={10} />
        <Scrolling mode="virtual" />
        <Selection mode="single" />
      </DataGrid>
    );
  }, [props.data, selectedRowKeys]);

  return (
    <DropDownBox
      onOptionChanged={boxOptionChanged}
      opened={isDropDownOpened}
      dropDownOptions={{ width: 500 }}
      dataSource={props.data.column.lookup.dataSource}
      value={selectedRowKeys[0]}
      displayExpr="name"
      valueExpr="id"
      inputAttr={{ "arial-label": "product" }}
      contentRender={contentRender}
    />
  );
};
