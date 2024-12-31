"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";

import {
  TreeView,
  TreeViewRef,
  TreeViewTypes,
} from "devextreme-react/tree-view";

import * as events from "devextreme/events";
import { useScreenSize } from "@/hooks";
import { navigation } from "@/app/navigation";
import { usePathname } from "next/navigation";

export interface SideNavigationMenuProps {
  selectedItemChanged: (e: TreeViewTypes.ItemClickEvent) => void;
  openMenu: (e: React.PointerEvent) => void;
  compactMode: boolean;
  onMenuReady: (e: TreeViewTypes.ContentReadyEvent) => void;
}

export const SideNavigationMenu = (
  props: React.PropsWithChildren<SideNavigationMenuProps>,
) => {
  const { children, selectedItemChanged, openMenu, compactMode, onMenuReady } =
    props;

  const { isLarge } = useScreenSize();

  const items = useMemo(() => {
    return navigation.map((item) => ({
      ...item,
      expaned: isLarge,
      path: item.path && !/^\//.test(item.path) ? `/${item.path}` : item.path,
    }));
  }, [isLarge]);

  // const {
  //   navigationData: { currentPath },
  // } = useNavigation();

  const currentPath = usePathname();
  const treeViewRef = useRef<TreeViewRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getWrapperRef = useCallback(
    (element: HTMLDivElement) => {
      const prevElement = wrapperRef.current;
      if (prevElement) {
        events.off(prevElement, "dxclick");
      }

      wrapperRef.current = element;
      events.on(element, "dxclick", (e: React.PointerEvent) => {
        openMenu(e);
      });
    },
    [openMenu],
  );

  useEffect(() => {
    const treeView = treeViewRef.current && treeViewRef.current.instance();
    if (!treeView) {
      return;
    }

    if (currentPath !== undefined) {
      treeView.selectItem(currentPath);
      treeView.expandItem(currentPath);
    }

    if (compactMode) {
      treeView.collapseAll();
    }
  }, [currentPath, compactMode]);

  return (
    <div
      className="dx-swatch-additional side-navigation-menu"
      ref={getWrapperRef}
    >
      {children}
      <div className="menu-container theme-dependent">
        <TreeView
          ref={treeViewRef}
          items={items}
          keyExpr="path"
          selectionMode="single"
          focusStateEnabled={false}
          expandEvent="click"
          onItemClick={selectedItemChanged}
          onContentReady={onMenuReady}
          width="100%"
        />
      </div>
      {/* <AppFooter> */}
      {/*   Copyright © {new Date().getFullYear()} <br /> Developer Express Inc. */}
      {/* </AppFooter> */}
    </div>
  );
};
