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
        html: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing in markdown…",
      }),
    ],
    content: value,
    onUpdate: ({ editor: tiptap }) => {
      const markdown = tiptap.storage.markdown.getMarkdown();
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
    const currentMarkdown = editor.storage.markdown.getMarkdown();
    if (value !== currentMarkdown) {
      editor.commands.setContent(value, false);
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
