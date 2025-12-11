import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from '@tiptap/markdown'

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  onStatsChange?: (stats: { wordCount: number }) => void;
  blurSignal?: number;
  focusSignal?: number;
};

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

function Editor({ value, onChange, onStatsChange, blurSignal, focusSignal }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          languageClassPrefix: "language-",
        },
      }),
      Markdown.configure({
        indentation: {
          style: 'space', // 'space' or 'tab'
          size: 2, // Number of spaces or tabs
        },
      }),
    ],
    onCreate: ({ editor }) => {
      editor.commands.setContent(value, { emitUpdate: false, contentType: "markdown" });
    },
    onUpdate: ({ editor: tiptap }) => {
      const markdown = tiptap.getMarkdown();
      onChange(markdown);
      if (onStatsChange) {
        onStatsChange({ wordCount: countWords(tiptap.getText()) });
      }
    },
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentMarkdown = editor.getMarkdown();
    if (value !== currentMarkdown) {
      editor.commands.setContent(value, { emitUpdate: false, contentType: "markdown" });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !onStatsChange) return;
    onStatsChange({ wordCount: countWords(editor.getText()) });
  }, [editor, onStatsChange, value]);

  useEffect(() => {
    if (!editor || !blurSignal) return;
    editor.commands.blur();
  }, [editor, blurSignal]);

  useEffect(() => {
    if (!editor) return;
    const handler = (event: MouseEvent) => {
      if (!contentRef.current) return;
      if (contentRef.current.contains(event.target as Node)) return;
      editor.commands.blur();
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || !focusSignal) return;
    let raf: number | null = null;
    const focusWhenReady = () => {
      if (!editor || editor.isDestroyed) return;
      if (!editor.view) {
        raf = requestAnimationFrame(focusWhenReady);
        return;
      }
      editor.commands.focus();
    };
    focusWhenReady();
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [editor, focusSignal]);

  if (!editor) {
    return <div className="editor-loading">Loading editor…</div>;
  }

  return (
    <div className="editor-surface">
      <EditorContent editor={editor} ref={contentRef} />
    </div>
  );
}

export default Editor;
