"use client";

import React from "react";
import Toolbar, { Item } from "devextreme-react/toolbar";
import TextBox from "devextreme-react/text-box";
import Button, { ButtonTypes } from "devextreme-react/button";

export interface AppHeaderProps {
  menuToggleEnabled: boolean;
  title?: string;
  toggleMenuAction: (e: ButtonTypes.ClickEvent) => void;
  className?: string;
}

export function AppHeader({
  menuToggleEnabled,
  title,
  toggleMenuAction: toggleMenu,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={`header-component  flex-[0_0_auto] z-10 py-3 px-0 ${className}`}
    >
      <Toolbar className="header-toolbar pr-3">
        <Item
          visible={menuToggleEnabled}
          location="before"
          widget="dxButton"
          cssClass="menu-button w-5 text-center p-0"
        >
          <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
        </Item>
        <Item
          location="before"
          cssClass="header-title text-sm"
          text={title}
          visible={!!title}
        />
        <Item
          location="after"
          locateInMenu="auto"
          cssClass="global-search-box pr-[11px]"
        >
          <TextBox
            placeholder="Search"
            width={180}
            mode="search"
            stylingMode="filled"
          />
        </Item>
        {/* <Item location="after" locateInMenu="never"> */}
        {/*   <ThemeSwitcher /> */}
        {/* </Item> */}
        <Item location="after">
          <div className="messages relative ">
            <Button icon="belloutline" stylingMode="text" />
            <div className="dx-badge absolute bg-red-600 text-white -top-[10%] -right-[10%] flex items-center justify-center rounded-sm">
              4
            </div>
          </div>
        </Item>
        {/* <Item */}
        {/*   location="after" */}
        {/*   locateInMenu="auto" */}
        {/*   menuItemTemplate="userPanelTemplate" */}
        {/* > */}
        {/*   <UserPanel menuMode="context" /> */}
        {/* </Item> */}
        {/* <Template name="userPanelTemplate"> */}
        {/*   <UserPanel menuMode="list" /> */}
        {/* </Template> */}
      </Toolbar>
    </header>
  );
}
