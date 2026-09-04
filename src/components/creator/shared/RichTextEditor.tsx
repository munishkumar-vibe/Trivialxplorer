"use client";

import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export interface RichTextEditorHandle {
  insertImage: (src: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  error?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rte-toolbar-btn${active ? " rte-toolbar-btn--active" : ""}`}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor({ value, onChange, placeholder, error }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        Placeholder.configure({ placeholder: placeholder ?? "Write your content here…" }),
        Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
        Image.configure({ HTMLAttributes: { class: "rte-img" } }),
      ],
      content: value,
      editorProps: {
        attributes: { class: "rte-content", "aria-label": "Content editor", "aria-multiline": "true" },
      },
      onUpdate({ editor }) {
        onChange(editor.getHTML(), editor.getText());
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage: (src: string) => {
        editor?.chain().focus().setImage({ src }).run();
      },
    }), [editor]);

    useEffect(() => {
      if (!editor) return;
      const current = editor.getText();
      if (current !== value && value === "") {
        editor.commands.clearContent();
      }
    }, [value, editor]);

    if (!editor) return null;

    // Collapse selection to head position before toggling heading so only the
    // current block is affected, not all blocks that overlap the selection.
    function applyHeading(level: 2 | 3) {
      const pos = editor.state.selection.head;
      editor.chain().focus().setTextSelection(pos).toggleHeading({ level }).run();
    }

    return (
      <div className={`rte-wrapper${error ? " rte-wrapper--error" : ""}`}>
        <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">
          <div className="rte-toolbar-group rte-toolbar-group--essential">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              label="Bold"
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              label="Italic"
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const prev = editor.getAttributes("link").href;
                const url = window.prompt("URL", prev ?? "");
                if (url) editor.chain().focus().setLink({ href: url }).run();
                else if (url === "") editor.chain().focus().unsetLink().run();
              }}
              active={editor.isActive("link")}
              label="Insert link"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </ToolbarButton>
          </div>

          <div className="rte-toolbar-group rte-toolbar-group--extended">
            <ToolbarButton
              onClick={() => applyHeading(2)}
              active={editor.isActive("heading", { level: 2 })}
              label="Heading 2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => applyHeading(3)}
              active={editor.isActive("heading", { level: 3 })}
              label="Heading 3"
            >
              H3
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              label="Bullet list"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              label="Numbered list"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              label="Blockquote"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>
            </ToolbarButton>
          </div>

          <div className="rte-toolbar-group rte-toolbar-group--history">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              label="Undo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              label="Redo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
              </svg>
            </ToolbarButton>
          </div>
        </div>

        <EditorContent editor={editor} />
      </div>
    );
  }
);

export default RichTextEditor;
