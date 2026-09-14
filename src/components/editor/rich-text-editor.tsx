"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading2, List, ListOrdered, Quote,
  Link as LinkIcon, ImageIcon, Undo, Redo,
} from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mediaApi } from "@/lib/api/media";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Real WYSIWYG editor (Tiptap) replacing the earlier plain textarea.
 * Outputs sanitized-ish HTML on `onChange` — same contract the backend's
 * `content` field already expects, so no API changes were needed to
 * swap this in.
 */
export function RichTextEditor({ value, onChange, disabled, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Write your story…" }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
  });

  // Keep the editor in sync if `value` changes externally (e.g. loading
  // an existing post asynchronously after the editor already mounted).
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const addLink = () => {
    const url = window.prompt("Link URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  };

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const media = await mediaApi.uploadImage(file);
      editor?.chain().focus().setImage({ src: media.url, alt: file.name }).run();
    };
    input.click();
  };

  if (!editor) return null;

  const toolbarButtons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { icon: LinkIcon, action: addLink, active: editor.isActive("link") },
    { icon: ImageIcon, action: addImage, active: false },
  ];

  return (
    <div className={cn("rounded-md border", disabled && "opacity-60")}>
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
        {toolbarButtons.map((b, i) => (
          <Button
            key={i}
            type="button"
            variant={b.active ? "secondary" : "ghost"}
            size="icon"
            disabled={disabled}
            onClick={b.action}
          >
            <b.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="mx-1 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
