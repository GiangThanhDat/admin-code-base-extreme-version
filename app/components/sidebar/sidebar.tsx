"use client";

import React, { useState, useCallback, useEffect } from "react";

import Drawer from "devextreme-react/drawer";
import { Template } from "devextreme-react/core/template";
import { TreeViewTypes } from "devextreme-react/tree-view";

export type SideNavigationItem = {
  expanded: boolean;
  path: string;
  text: string;
  icon: string;
  items: Array<{
    text: string;
    path: string;
  }>;
};

import { useRouter } from "next/navigation";
import { useMenuPatch, useScreenSize } from "@/hooks";
import { SideNavigationMenu } from "@/app/components/sidebar/sidebar-menu";
import { AppHeader } from "@/app/components/app-header";

import { ButtonTypes } from "devextreme-react/button";

enum MenuOpenState {
  Closed = 1,
  Opened = 2,
  TemporaryOpened = 3,
}

type MenuStatus = MenuOpenState | null;

export interface SideNavToolbarProps {
  title: string;
}

export const Sidebar = ({
  children,
  title,
}: React.PropsWithChildren<SideNavToolbarProps>) => {
  // const navigate = useNavigate();
  const router = useRouter();
  const { isXSmall, isLarge } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const [menuStatus, setMenuStatus] = useState<MenuStatus>(null);

  const getDefaultMenuOpenState = useCallback(
    () => (isLarge ? MenuOpenState.Opened : MenuOpenState.Closed),
    [isLarge],
  );
  const getMenuOpenState = useCallback(
    (status: MenuStatus) => {
      if (status === null) {
        return getDefaultMenuOpenState();
      }

      return status;
    },
    [getDefaultMenuOpenState],
  );

  const getMenuStatus = useCallback(
    (status: MenuStatus) => {
      return status === getDefaultMenuOpenState() ? null : status;
    },
    [getDefaultMenuOpenState],
  );

  const changeMenuStatus = useCallback(
    (reducerFn: (prevStatus: MenuStatus) => MenuStatus) => {
      setMenuStatus((prevMenuStatus) =>
        getMenuStatus(
          reducerFn(getMenuOpenState(prevMenuStatus)) ?? prevMenuStatus,
        ),
      );
    },
    [getMenuOpenState, getMenuStatus],
  );

  const toggleMenu = useCallback(
    ({ event }: ButtonTypes.ClickEvent) => {
      changeMenuStatus((prevStatus) =>
        prevStatus === MenuOpenState.Closed
          ? MenuOpenState.Opened
          : MenuOpenState.Closed,
      );
      event?.stopPropagation();
    },
    [changeMenuStatus],
  );

  const temporaryOpenMenu = useCallback(() => {
    changeMenuStatus((prevStatus) =>
      prevStatus === MenuOpenState.Closed
        ? MenuOpenState.TemporaryOpened
        : null,
    );
  }, [changeMenuStatus]);

  const onOutsideClick = useCallback(() => {
    changeMenuStatus((prevStatus) =>
      prevStatus !== MenuOpenState.Closed && !isLarge
        ? MenuOpenState.Closed
        : null,
    );
    return !isLarge;
  }, [isLarge, changeMenuStatus]);

  const onNavigationChanged = useCallback(
    ({
      itemData: { path },
      event,
      node,
    }: TreeViewTypes.ItemClickEvent & { itemData: SideNavigationItem }) => {
      if (
        getMenuOpenState(menuStatus) === MenuOpenState.Closed ||
        !path ||
        node?.selected
      ) {
        event?.preventDefault();
        return;
      }

      router.push(path);
      if (!isLarge || menuStatus === MenuOpenState.TemporaryOpened) {
        setMenuStatus(getMenuStatus(MenuOpenState.Closed));
        event?.stopPropagation();
      }
    },
    [router, menuStatus, isLarge, getMenuOpenState, getMenuStatus],
  ) as (e: TreeViewTypes.ItemClickEvent) => void;

  useEffect(() => {
    changeMenuStatus(() => menuStatus);
  }, [isLarge, changeMenuStatus, menuStatus]);

  return (
    <div className="side-nav-outer-toolbar">
      <AppHeader
        className="layout-header"
        menuToggleEnabled
        toggleMenuAction={toggleMenu}
        title={title}
      />
      <Drawer
        className={["drawer layout-body", patchCssClass].join(" ")}
        position="before"
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge ? "shrink" : "overlap"}
        revealMode={isXSmall ? "slide" : "expand"}
        minSize={isXSmall ? 0 : 48}
        maxSize={250}
        shading={isLarge ? false : true}
        opened={
          getMenuOpenState(menuStatus) === MenuOpenState.Closed ? false : true
        }
        template="menu"
      >
        <div className="content">
          {/* {React.Children.map(children, (item) => { */}
          {/*   return ( */}
          {/*     React.isValidElement(item) && item.type !== AppFooter && item */}
          {/*   ); */}
          {/* })} */}
          {children}
        </div>
        <Template name="menu">
          <SideNavigationMenu
            compactMode={getMenuOpenState(menuStatus) === MenuOpenState.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={temporaryOpenMenu}
            onMenuReady={onMenuReady}
          />
        </Template>
      </Drawer>
    </div>
  );
};
