import {useCallback, useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {listen} from "@tauri-apps/api/event";
import Editor from "./components/Editor";
import StatusBar from "./components/StatusBar";

type EditorStats = {
  wordCount: number;
};

const UNTITLED = "Untitled.md";

const getFileName = (path: string | null) => {
  if (!path) return UNTITLED;
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] || UNTITLED;
};

function App() {
  const [content, setContent] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>(UNTITLED);
  const [isDirty, setIsDirty] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const lastSavedContent = useRef("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => setTheme(event.matches ? "dark" : "light");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  }, [theme]);

  // Update native window title
  useEffect(() => {
    const title = isDirty ? `${documentTitle} •` : documentTitle;
    getCurrentWindow().setTitle(title).then(_ => {});
  }, [documentTitle, isDirty]);

  const markClean = useCallback(
    (newContent: string, filePath: string | null) => {
      lastSavedContent.current = newContent;
      setIsDirty(false);
      setCurrentFilePath(filePath);
      setDocumentTitle(getFileName(filePath));
    },
    [setCurrentFilePath, setDocumentTitle],
  );

  const handleStatsChange = useCallback((stats: EditorStats) => {
    setWordCount(stats.wordCount);
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setIsDirty(value !== lastSavedContent.current);
  }, []);

  const writeFile = useCallback(
    async (path: string) => {
      try {
        await invoke("write_file", { path, contents: content });
        markClean(content, path);
        return true;
      } catch (error) {
        alert(`Failed to save file: ${error}`);
        return false;
      }
    },
    [content, markClean],
  );

  const handleSaveAs = useCallback(async () => {
    try {
      const selectedPath = (await invoke<string | null>("show_save_dialog", {
        default_file_name: getFileName(currentFilePath),
      })) as string | null;
      if (!selectedPath) return false;
      return await writeFile(selectedPath);
    } catch (error) {
      alert(`Save As failed: ${error}`);
      return false;
    }
  }, [currentFilePath, writeFile]);

  const handleSave = useCallback(async () => {
    if (!currentFilePath) {
      return await handleSaveAs();
    }
    return await writeFile(currentFilePath);
  }, [currentFilePath, handleSaveAs, writeFile]);

  const confirmDirtyFlow = useCallback(async () => {
    if (!isDirty) return true;
    const save = window.confirm("You have unsaved changes. Save them?");
    if (save) {
      return await handleSave();
    }
    return window.confirm("Discard unsaved changes?");
  }, [handleSave, isDirty]);

  const handleNew = useCallback(async () => {
    const proceed = await confirmDirtyFlow();
    if (!proceed) return;
    setContent("");
    markClean("", null);
  }, [confirmDirtyFlow, markClean]);

  const handleOpen = useCallback(async () => {
    const proceed = await confirmDirtyFlow();
    if (!proceed) return;
    try {
      const selectedPath = (await invoke<string | null>("show_open_dialog")) as string | null;
      if (!selectedPath) return;
      const fileContent = (await invoke<string>("read_file", { path: selectedPath })) as string;
      setContent(fileContent);
      markClean(fileContent, selectedPath);
    } catch (error) {
      alert(`Failed to open file: ${error}`);
    }
  }, [confirmDirtyFlow, markClean]);

  useEffect(() => {
    const unlisten = listen<string>("menu-event", (event) => {
      switch (event.payload) {
        case "new":
          handleNew();
          break;
        case "open":
          handleOpen();
          break;
        case "save":
          handleSave();
          break;
        case "save_as":
          handleSaveAs();
          break;
        case "toggle_status_bar":
          setShowStatusBar((prev) => !prev);
          break;
        case "settings":
          console.log("Settings clicked");
          break;
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [handleNew, handleOpen, handleSave, handleSaveAs]);

  return (
    <div className="app-shell">
      <div className="editor-area">
        <Editor value={content} onChange={handleContentChange} onStatsChange={handleStatsChange} />
      </div>
      {showStatusBar && <StatusBar wordCount={wordCount} />}
    </div>
  );
}

export default App;
