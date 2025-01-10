"use client";
import { useEditorStore } from "@/store/use-editor-store";
import { Button, Popup, SelectBox, TextBox } from "devextreme-react";
import {
  AlignCenter,
  AlignLeft,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  LucideIcon,
  MessageSquarePlusIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SearchIcon,
  SpellCheckIcon,
  UnderlineIcon,
  UndoIcon,
  UploadIcon,
} from "lucide-react";
import { type ColorResult, SketchPicker } from "react-color";
import { type Level } from "@tiptap/extension-heading";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { TextBoxTypes } from "devextreme-react/cjs/text-box";

const LineHeightButton = () => {
  const { editor } = useEditorStore();

  const lineHeights = [
    {
      label: "Default",
      value: "normal",
    },
    {
      label: "Single",
      value: "1",
    },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1,5" },
    {
      label: "Double",
      value: "2",
    },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
          aria-label="Customise options"
        >
          <ListCollapseIcon className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5"
          sideOffset={5}
        >
          {lineHeights.map(({ label, value }) => {
            return (
              <button
                key={label}
                onClick={() =>
                  editor?.chain().focus().setLineHeight(value).run()
                }
                className={`flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 ${editor?.getAttributes("paragraph").lineHeight === value && "bg-neutral-200/80"}`}
              >
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const FontSizeButton = () => {
  const { editor } = useEditorStore();
  const currentFontSize = editor?.getAttributes("textStyle").fontSize
    ? editor?.getAttributes("textStyle").fontSize.replace("px", "")
    : 16;

  const [fontSize, setFontSize] = useState(currentFontSize);
  const [inputValue, setInputValue] = useState(fontSize);
  const [isEditing, setIsEditing] = useState(false);

  const updateFontSize = (newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}px`).run();
      setFontSize(newSize);
      setInputValue(newSize);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    updateFontSize(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateFontSize(inputValue);
      editor?.commands.focus();
    }
  };

  const increment = () => {
    const newSize = parseInt(fontSize) + 1;
    updateFontSize(newSize.toString());
  };

  const decrement = () => {
    const newSize = parseInt(fontSize) - 1;
    if (newSize > 0) {
      updateFontSize(newSize.toString());
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <button
        onClick={decrement}
        className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
      >
        <MinusIcon className="size-4" />
      </button>
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm bg-transparent focus:outline-none focus:ring-0"
        />
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
            setFontSize(currentFontSize);
          }}
          className="h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm bg-transparent"
        >
          {currentFontSize}
        </button>
      )}
      <button
        onClick={increment}
        className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
};

const ListButton = () => {
  const { editor } = useEditorStore();

  const lists = [
    {
      label: "Bullet List",
      icon: ListIcon,
      isActive: () => editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-7 min-w-7shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
          aria-label="Customise options"
        >
          <ListIcon className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5"
          sideOffset={5}
        >
          {lists.map(({ label, icon: Icon, onClick, isActive }) => {
            return (
              <button
                key={label}
                onClick={onClick}
                className={`flex w-full items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 ${isActive() && "bg-neutral-200/80"}`}
              >
                <Icon className="size-4" />{" "}
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const AlignButton = () => {
  const { editor } = useEditorStore();

  const alignments = [
    {
      label: "Align left",
      value: "left",
      icon: AlignLeft,
    },
    {
      label: "Align center",
      value: "center",
      icon: AlignCenter,
    },
    {
      label: "Align Right",
      value: "right",
      icon: AlignRightIcon,
    },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
          aria-label="Customise options"
        >
          <AlignLeftIcon className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5"
          sideOffset={5}
        >
          {alignments.map(({ label, value, icon: Icon }) => {
            return (
              <button
                key={label}
                onClick={() =>
                  editor?.chain().focus().setTextAlign(value).run()
                }
                className={`flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 ${editor?.isActive({ TextAlign: value }) && "bg-neutral-200/80"}`}
              >
                <Icon className="size-4" />{" "}
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const ImageButton = () => {
  const { editor } = useEditorStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run();
  };

  const onUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
      }
    };

    input.click();
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      onChange(imageUrl);
      setImageUrl("");
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200"
            aria-label="Customise options"
          >
            <ImageIcon className="size-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white p-2.5 "
            sideOffset={5}
          >
            <DropdownMenu.Item onClick={onUpload}>
              <UploadIcon className="size-4 mr-2" />
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                setIsDialogOpen(true);
              }}
            >
              <SearchIcon className="size-4 mr-2" />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Popup
        visible={isDialogOpen}
        onHiding={() => setIsDialogOpen(false)}
        title="Inser image URL"
      >
        <TextBox
          placeholder="Paste URL here"
          valueChangeEvent="keyup"
          onValueChanged={(data: TextBoxTypes.ValueChangedEvent) => {
            setImageUrl(data.value);
          }}
          onKeyDown={(e: TextBoxTypes.KeyDownEvent) => {
            if (e.event?.key === "Enter") {
              handleImageUrlSubmit();
            }
          }}
        />
      </Popup>
    </>
  );
};

const LinkButton = () => {
  const { editor } = useEditorStore();

  const [value, setValue] = useState(editor?.getAttributes("link").href || "");

  const onChange = (href: string) => {
    editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setValue("");
  };

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
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={() => onChange(value)}>Apply</Button>
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
    <div className="bg-[#F1F4F9] px-2.5 py-0.5 min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
      {sections[0].map((item) => {
        return <ToolbarButton key={item.label} {...item} />;
      })}
      {/* separator */}
      <FontFamilyButton />
      {/* separator */}
      <HeadingLevelButton />
      {/* separator */}
      <FontSizeButton />
      {sections[1].map((item) => {
        return <ToolbarButton key={item.label} {...item} />;
      })}
      <TextColorButton />
      <HightlightColorButton />
      <LinkButton />
      <ImageButton />
      <AlignButton />
      <LineHeightButton />
      <ListButton />
      {sections[2].map((item) => {
        return <ToolbarButton key={item.label} {...item} />;
      })}
    </div>
  );
}
