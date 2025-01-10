"use client";
import { useEditorStore } from "@/store/use-editor-store";
import { SelectBox, TextBox } from "devextreme-react";
import {
  BoldIcon,
  HighlighterIcon,
  ItalicIcon,
  Link2Icon,
  ListTodoIcon,
  LucideIcon,
  MessageSquarePlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SpellCheckIcon,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";
import { type ColorResult, SketchPicker } from "react-color";
import { type Level } from "@tiptap/extension-heading";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

const LinkButton = () => {
  const { editor } = useEditorStore();

  const [value, setValue] = useState(editor?.getAttributes("link").href || "");

  const onChange = (href: string) => {
    editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setValue("");
  };

  console.log("value:", value);
  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (open) {
          setValue(editor?.getAttributes("link").href || "");
        }
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
          aria-label="Customise options"
        >
          <Link2Icon className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5 flex items-center gap-x-2"
          sideOffset={5}
        >
          <input
            placeholder="Paste link"
            value={value}
            onChange={(e) => setValue()}
          />
          <button onClick={() => onChange(value)}>Apply</button>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const HightlightColorButton = () => {
  const { editor } = useEditorStore();

  const value = editor?.getAttributes("hightlight").color || "#FFFFF";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setHighlight({ color: color.hex }).run();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
          aria-label="Customise options"
        >
          <HighlighterIcon className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5"
          sideOffset={5}
        >
          <SketchPicker color={value} onChange={onChange} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const TextColorButton = () => {
  const { editor } = useEditorStore();
  const value = editor?.getAttributes("textStyle").color || "#00000";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setColor(color.hex).run();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
          aria-label="Customise options"
        >
          <span className="text-xs">A</span>
          <div className="h-0.5 w-full" style={{ backgroundColor: value }} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5"
          sideOffset={5}
        >
          <SketchPicker color={value} onChange={onChange} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const HeadingLevelButton = () => {
  const { editor } = useEditorStore();
  const headings = [
    { label: "Normal text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ];

  const getCurrentHeading = () => {
    for (let level = 1; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`;
      }
    }
    return "Normal text";
  };

  return (
    <SelectBox
      items={headings}
      onValueChanged={(e) => {
        if (e.value.value === 0) {
          editor?.chain().focus().setParagraph().run();
        } else {
          editor
            ?.chain()
            .focus()
            .toggleHeading({ level: e.value.value as Level })
            .run();
        }
      }}
      fieldRender={() => {
        return <TextBox defaultValue={getCurrentHeading()} />;
      }}
      itemRender={({ label, value, fontSize }) => {
        return (
          <button
            key={value}
            style={{ fontSize }}
            className={`flex w-full items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 ${
              (0 === value && !editor?.isActive("heading")) ||
              (editor?.isActive("heading", {
                level: value,
              }) &&
                "bg-neutral-200/80")
            }`}
          >
            {label}
          </button>
        );
      }}
    />
  );
};

const FontFamilyButton = () => {
  const { editor } = useEditorStore();

  const fonts = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
  ];

  return (
    <SelectBox
      items={fonts}
      onValueChanged={(e) => {
        editor?.chain()?.focus().setFontFamily(e.value.value).run();
      }}
      fieldRender={() => {
        // console.log("drop down button render props:", props);
        // return (
        //   <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
        //     <span className="truncate">
        //       {editor?.getAttributes("textStyle").fontFamily || "Arial"}
        //     </span>
        //     <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        //   </button>
        // );
        return (
          <TextBox
            readOnly
            defaultValue={
              editor?.getAttributes("textStyle").fontFamily || "Arial"
            }
          />
        );
      }}
      itemRender={({ label, value }) => {
        return (
          <button
            key={value}
            className={`flex w-full items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 ${editor?.getAttributes("testStyle").fontFamily === value && "bg-neutral-200/80"}`}
            style={{ fontFamily: value }}
          >
            <span className="text-sm">{label}</span>
          </button>
        );
      }}
    />
  );
};

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
}

const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
}: ToolbarButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 ${isActive ? `bg-neutral-200/80` : ``}`}
    >
      <Icon className="size-4" />
    </button>
  );
};

export function Toolbar() {
  const { editor } = useEditorStore();

  const sections: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
  }[][] = [
    [
      {
        label: "Undo",
        icon: UndoIcon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: PrinterIcon,
        onClick: () => window.print(),
      },
      {
        label: "Spell check",
        icon: SpellCheckIcon,
        onClick: () => {
          const current = editor?.view.dom.getAttribute("spellcheck");
          editor?.view.dom.setAttribute(
            "spellcheck",
            current === "false" ? "true" : "false",
          );
        },
      },
    ],
    [
      {
        label: "Bold",
        icon: BoldIcon,
        isActive: editor?.isActive("bold"),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "italic",
        icon: ItalicIcon,
        isActive: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        icon: UnderlineIcon,
        isActive: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "Comment",
        icon: MessageSquarePlusIcon,
        onClick: () => console.log("TODO: Comment"),
        isActive: false,
      },
      {
        label: "List Todo",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
        isActive: editor?.isActive("unsetAllMarks"),
      },
    ],
  ];

  return (
    <div className="bg-[#F1F4F9] px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
      {sections[0].map((item) => {
        return <ToolbarButton key={item.label} {...item} />;
      })}
      {/* separator */}
      {/* todo font family */}
      <FontFamilyButton />
      {/* separator */}
      {/* todo heading */}
      <HeadingLevelButton />
      {/* separator */}
      {/* todo font size */}
      {sections[1].map((item) => {
        return <ToolbarButton key={item.label} {...item} />;
      })}
      {/* TODO : Text color*/}
      <TextColorButton />
      {/* TODO : Highlight color*/}
      <HightlightColorButton />
      {/* TODO : Highlight color*/}
      {/* TODO : Link */}
      <LinkButton />
      {/* TODO : Image */}
      {/* TODO : Align */}
      {/* TODO : Line height */}
      {/* TODO : List*/}
      {sections[2].map((item) => {
        return <ToolbarButton key={item.label} {...item} />;
      })}
    </div>
  );
}
