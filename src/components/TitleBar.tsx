type Props = {
  title: string;
  isDirty: boolean;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
};

function TitleBar({ title, isDirty, onNew, onOpen, onSave, onSaveAs }: Props) {
  return (
    <header className="title-bar">
      <div className="title-group">
        <span className="title-text">{title}</span>
        {isDirty ? <span className="dirty-indicator" aria-label="Unsaved changes"></span> : null}
      </div>
      <div className="title-actions">
        <button type="button" onClick={onNew} title="New (Cmd/Ctrl + N)">
          New
        </button>
        <button type="button" onClick={onOpen} title="Open (Cmd/Ctrl + O)">
          Open
        </button>
        <button type="button" onClick={onSave} title="Save (Cmd/Ctrl + S)">
          Save
        </button>
        <button type="button" onClick={onSaveAs} title="Save As (Cmd/Ctrl + Shift + S)">
          Save As
        </button>
      </div>
    </header>
  );
}

export default TitleBar;
