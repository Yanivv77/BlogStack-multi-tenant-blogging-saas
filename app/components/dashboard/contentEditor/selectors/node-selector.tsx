import { Popover } from "@radix-ui/react-popover";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "@/components/ui/button";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SelectorItem {
  name: string;
  icon: string;
  command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
  isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
}

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: "text",
    command: (editor) => editor?.chain().focus().toggleNode("paragraph", "paragraph").run(),
    isActive: (editor) =>
      (!!editor?.isActive("paragraph") && !editor?.isActive("bulletList") && !editor?.isActive("orderedList")) || false,
  },
  {
    name: "Heading 1",
    icon: "heading",
    command: (editor) => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => !!editor?.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: "heading",
    command: (editor) => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => !!editor?.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: "heading",
    command: (editor) => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => !!editor?.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: "check",
    command: (editor) => editor?.chain().focus().toggleTaskList().run(),
    isActive: (editor) => !!editor?.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: "list",
    command: (editor) => editor?.chain().focus().toggleBulletList().run(),
    isActive: (editor) => !!editor?.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: "list",
    command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => !!editor?.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: "quote",
    command: (editor) => editor?.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
    isActive: (editor) => !!editor?.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: "code",
    command: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => !!editor?.isActive("codeBlock"),
  },
];
interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
    icon: "text",
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="gap-2 rounded-none border-none hover:bg-accent focus:ring-0">
        <Button variant="ghost" className="gap-2">
          <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
          <SimpleIcon name="chevrondown" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {items.map((item, index) => (
          <EditorBubbleItem
            key={index}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1">
                <SimpleIcon name={item.icon} size={12} />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <SimpleIcon name="check" size={16} />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
