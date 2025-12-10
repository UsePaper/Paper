import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from '@tiptap/markdown'
import { Placeholder } from '@tiptap/extensions'

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  onStatsChange?: (stats: { wordCount: number }) => void;
};

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

function Editor({ value, onChange, onStatsChange }: Props) {
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
      Placeholder.configure({
        placeholder: "Start writing…",
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
  }, [editor, onStatsChange]);

  if (!editor) {
    return <div className="editor-loading">Loading editor…</div>;
  }

  return (
    <div className="editor-surface" onClick={() => editor.commands.focus()}>
      <EditorContent editor={editor} />
    </div>
  );
}

export default Editor;
