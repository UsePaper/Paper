import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import { defaultSettings, loadSavedSettings, persistSettings, Settings } from './settings';
import { useApplyTheme, useSystemTheme } from './hooks/theme';

type EditorStats = {
  wordCount: number;
};

const UNTITLED = 'Untitled.md';
const NEW_CONTENT = '###';

const getFileName = (path: string | null) => {
  if (!path) return UNTITLED;
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] || UNTITLED;
};

function App() {
  const [content, setContent] = useState(NEW_CONTENT);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>(UNTITLED);
  const [isDirty, setIsDirty] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastSavedContent = useRef('');
  const [blurEditorSignal, setBlurEditorSignal] = useState(0);
  const [focusEditorSignal, setFocusEditorSignal] = useState(() => Date.now());
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const systemTheme = useSystemTheme(settings.themeMode === 'system');
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadSavedSettings().then((loaded) => {
      if (!mounted) return;
      setSettings(loaded);
      setHasLoadedSettings(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const fontFamily = settings.fontFamily === 'System' ? 'var(--font-body)' : settings.fontFamily;
    root.style.setProperty('--editor-font-family', fontFamily);
    root.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--editor-line-height', `${settings.lineHeight}`);
    root.style.setProperty('--editor-content-width', `${settings.contentWidth}px`);
  }, [settings]);

  const appliedTheme = settings.themeMode === 'system' ? systemTheme : settings.themeMode;

  useApplyTheme(appliedTheme, settings.themeMode);

  // Update native window title
  useEffect(() => {
    const title = isDirty ? `${documentTitle} •` : documentTitle;
    getCurrentWindow()
      .setTitle(title)
      .then((_) => {});
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
        await invoke('write_file', { path, contents: content });
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
      const selectedPath = (await invoke<string | null>('show_save_dialog', {
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
    const save = window.confirm('You have unsaved changes. Save them?');
    if (save) {
      return await handleSave();
    }
    return window.confirm('Discard unsaved changes?');
  }, [handleSave, isDirty]);

  const handleNew = useCallback(async () => {
    const proceed = await confirmDirtyFlow();
    if (!proceed) return;
    markClean(NEW_CONTENT, null);
    setContent(NEW_CONTENT);
    setFocusEditorSignal(Date.now());
  }, [confirmDirtyFlow, markClean]);

  const loadFilePath = useCallback(
    async (path: string) => {
      const proceed = await confirmDirtyFlow();
      if (!proceed) return false;
      try {
        const fileContent = (await invoke<string>('read_file', {
          path,
        })) as string;
        markClean(fileContent, path);
        setContent(fileContent);
        setBlurEditorSignal(Date.now());
        if (editorAreaRef.current) {
          editorAreaRef.current.scrollTo({ top: 0 });
        }
        return true;
      } catch (error) {
        alert(`Failed to open file: ${error}`);
        return false;
      }
    },
    [confirmDirtyFlow, markClean],
  );

  const handleOpen = useCallback(async () => {
    try {
      const selectedPath = (await invoke<string | null>('show_open_dialog')) as string | null;
      if (!selectedPath) return;
      await loadFilePath(selectedPath);
    } catch (error) {
      alert(`Failed to open file: ${error}`);
    }
  }, [loadFilePath]);

  useEffect(() => {
    // Check for startup file
    invoke<string | null>('get_startup_file').then((path) => {
      if (path) {
        loadFilePath(path);
      }
    });

    const unlisten = listen<string>('open-file', (event) => {
      loadFilePath(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [loadFilePath]);

  useEffect(() => {
    const unlisten = listen<string>('menu-event', (event) => {
      switch (event.payload) {
        case 'new':
          handleNew().then((_) => {});
          break;
        case 'open':
          handleOpen().then((_) => {});
          break;
        case 'save':
          handleSave().then((_) => {});
          break;
        case 'save_as':
          handleSaveAs().then((_) => {});
          break;
        case 'toggle_status_bar':
          setShowStatusBar((prev) => !prev);
          break;
        case 'settings':
          setSettingsOpen(true);
          break;
        case 'quit':
          getCurrentWindow()
            .close()
            .then((_) => {});
          break;
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [handleNew, handleOpen, handleSave, handleSaveAs]);

  useEffect(() => {
    if (!hasLoadedSettings) return;
    persistSettings(settings).then((_) => {});
  }, [settings, hasLoadedSettings]);

  useEffect(() => {
    const window = getCurrentWindow();
    const unlisten = window.onCloseRequested(async (event) => {
      if (!isDirty) return;
      const shouldQuit = await confirm('You have unsaved changes. Quit without saving?', {
        title: 'Unsaved changes',
        kind: 'error',
        okLabel: 'Quit',
        cancelLabel: 'Cancel',
      });
      if (!shouldQuit) {
        event.preventDefault();
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [isDirty]);

  return (
    <div className="app-shell">
      <div className="editor-area" ref={editorAreaRef}>
        <Editor
          value={content}
          onChange={handleContentChange}
          onStatsChange={handleStatsChange}
          blurSignal={blurEditorSignal}
          focusSignal={focusEditorSignal}
        />
      </div>
      {showStatusBar && <StatusBar wordCount={wordCount} />}
      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onChange={setSettings}
      />
    </div>
  );
}

export default App;
