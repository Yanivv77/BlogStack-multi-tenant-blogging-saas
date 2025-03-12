import { cn } from "@/lib/utils";
import { EditorBubbleItem, useEditor } from "novel";
import { SimpleIcon } from "@/components/ui/icons/SimpleIcon";
import type { SelectorItem } from "./node-selector";
import { Button } from "@/components/ui/button";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => !!editor?.isActive("bold"),
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      icon: "bold",
    },
    {
      name: "italic",
      isActive: (editor) => !!editor?.isActive("italic"),
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      icon: "italic",
    },
    {
      name: "underline",
      isActive: (editor) => !!editor?.isActive("underline"),
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      icon: "underline",
    },
    {
      name: "strike",
      isActive: (editor) => !!editor?.isActive("strike"),
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      icon: "strikethrough",
    },
    {
      name: "code",
      isActive: (editor) => !!editor?.isActive("code"),
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      icon: "code",
    },
  ];
  return (
    <div className='flex'>
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}>
          <Button size='icon' className='rounded-none' variant='ghost'>
            <SimpleIcon
              name={item.icon}
              size={16}
              className={cn({
                "text-blue-500": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};