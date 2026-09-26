"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
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

export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
      }),

      Image,

      Placeholder.configure({
        placeholder:
          placeholder ?? "Write your story…",
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
    ],

    content: value,

    editable: !disabled,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
  });

  /*
   * Keep editor synchronized when the post is loaded
   * or the value changes externally.
   */
  useEffect(() => {
    if (
      editor &&
      value !== editor.getHTML() &&
      !editor.isFocused
    ) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  /*
   * Enable/disable editor.
   */
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  /*
   * Add hyperlink.
   */
  const addLink = () => {
    const url = window.prompt("Link URL");

    if (!url) {
      return;
    }

    editor
      ?.chain()
      .focus()
      .setLink({
        href: url,
      })
      .run();
  };

  /*
   * Insert image into article content.
   */
  const addImage = async () => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      try {
        const media = await mediaApi.uploadImage(file);

        if (!media?.url) {
          throw new Error(
            "Image upload failed."
          );
        }

        editor
          ?.chain()
          .focus()
          .setImage({
            src: media.url,
            alt: file.name,
          })
          .run();
      } catch (error) {
        console.error(
          "Article image upload failed:",
          error
        );

        alert(
          "Unable to upload the image."
        );
      }
    };

    input.click();
  };

  /*
   * Check which alignment is active.
   */
  const isAlignmentActive = (
    alignment: "left" | "center" | "right"
  ) => {
    return (
      editor?.isActive("paragraph", {
        textAlign: alignment,
      }) ||
      editor?.isActive("heading", {
        textAlign: alignment,
      }) ||
      false
    );
  };

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      icon: Bold,
      action: () =>
        editor
          .chain()
          .focus()
          .toggleBold()
          .run(),
      active: editor.isActive("bold"),
      label: "Bold",
    },

    {
      icon: Italic,
      action: () =>
        editor
          .chain()
          .focus()
          .toggleItalic()
          .run(),
      active: editor.isActive("italic"),
      label: "Italic",
    },

    {
      icon: Heading2,
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({
            level: 2,
          })
          .run(),
      active: editor.isActive(
        "heading",
        {
          level: 2,
        }
      ),
      label: "Heading 2",
    },

    {
      icon: List,
      action: () =>
        editor
          .chain()
          .focus()
          .toggleBulletList()
          .run(),
      active: editor.isActive(
        "bulletList"
      ),
      label: "Bullet List",
    },

    {
      icon: ListOrdered,
      action: () =>
        editor
          .chain()
          .focus()
          .toggleOrderedList()
          .run(),
      active: editor.isActive(
        "orderedList"
      ),
      label: "Numbered List",
    },

    {
      icon: Quote,
      action: () =>
        editor
          .chain()
          .focus()
          .toggleBlockquote()
          .run(),
      active: editor.isActive(
        "blockquote"
      ),
      label: "Quote",
    },

    {
      icon: LinkIcon,
      action: addLink,
      active: editor.isActive("link"),
      label: "Link",
    },

    {
      icon: ImageIcon,
      action: addImage,
      active: false,
      label: "Insert Image",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-md border",
        disabled && "opacity-60"
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
        {toolbarButtons.map(
          (button, index) => (
            <Button
              key={index}
              type="button"
              variant={
                button.active
                  ? "secondary"
                  : "ghost"
              }
              size="icon"
              disabled={disabled}
              onClick={button.action}
              title={button.label}
              aria-label={button.label}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          )
        )}

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-border" />

        {/* LEFT */}
        <Button
          type="button"
          variant={
            isAlignmentActive("left")
              ? "secondary"
              : "ghost"
          }
          size="icon"
          disabled={disabled}
          title="Align Left"
          aria-label="Align Left"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("left")
              .run()
          }
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        {/* CENTER */}
        <Button
          type="button"
          variant={
            isAlignmentActive("center")
              ? "secondary"
              : "ghost"
          }
          size="icon"
          disabled={disabled}
          title="Align Center"
          aria-label="Align Center"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        {/* RIGHT */}
        <Button
          type="button"
          variant={
            isAlignmentActive("right")
              ? "secondary"
              : "ghost"
          }
          size="icon"
          disabled={disabled}
          title="Align Right"
          aria-label="Align Right"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-border" />

        {/* UNDO */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={
            disabled ||
            !editor.can().undo()
          }
          title="Undo"
          aria-label="Undo"
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          <Undo className="h-4 w-4" />
        </Button>

        {/* REDO */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={
            disabled ||
            !editor.can().redo()
          }
          title="Redo"
          aria-label="Redo"
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}