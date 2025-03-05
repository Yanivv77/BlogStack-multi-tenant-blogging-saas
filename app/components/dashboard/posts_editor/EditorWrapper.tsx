"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
  useEditor,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { uploadFn } from "./image-upload";
import MenuSwitch from "./menu-switch";
import { Separator } from "@/components/ui/separator";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

interface EditorProps {
  onChange?: (value: JSONContent) => void;
  initialValue?: JSONContent;
}

// Simple toolbar button component
const ToolbarButton = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="p-2 rounded hover:bg-muted transition-colors" 
    title={title}
  >
    {icon}
  </button>
);

const TailwindAdvancedEditor = ({ onChange, initialValue }: EditorProps) => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(true); // Set to true by default to make the menu visible
  
  const { editor } = useEditor();

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    if (onChange) {
      onChange(json);
    }
    setSaveStatus("Saved");
  }, 500);

  useEffect(() => {
    if (initialValue) {
      setInitialContent(initialValue);
    } else {
      const content = window.localStorage.getItem("novel-content");
      if (content) setInitialContent(JSON.parse(content));
    }
  }, [initialValue]);

  if (!initialContent) return null;

  return (
    <div className="relative w-full ">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
      </div>
      
   
      <div className="flex items-center border border-muted rounded-t-lg bg-background p-6 gap-2 mb-0">
        <div className="text-muted-foreground text-sm hidden [@media(min-width:1200px)]:flex items-center gap-2">
          <span className="bg-muted px-2 py-1 rounded font-mono">/</span>
          <span>Type to open command menu</span>
          <span className="mx-2">•</span>
          <span className="bg-muted px-2 py-1 rounded">Select text</span>
          <span>to show formatting options</span>
        </div>
      </div>
      
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full  border-muted bg-background  sm:rounded-b-lg sm:border sm:border-t-0 sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => typeof item.command === 'function' ? item.command(val) : null}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Use MenuSwitch for the bubble menu */}
          <MenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" className="h-6" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" className="h-6" />
            <MathSelector />
            <Separator orientation="vertical" className="h-6" />
            <TextButtons />
            <Separator orientation="vertical" className="h-6" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </MenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
