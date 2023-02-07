import Styles from "./Styles/Editor.module.css";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import Autofocus from "./plugins/Autofocus";
import Toolbar from "./Toolbar/Toolbar";
import { EditorConfig } from "./EditorConfig";

function Placeholder() {
  return <div className={Styles.EditorPlaceholder}></div>;
}

export function Editor() {
  return (
    <div className={Styles.EditorContainer}>
      <input
        type="text"
        required
        placeholder={"untitled"}
        className={Styles.TitleInput}
      />
      <LexicalComposer initialConfig={{ ...EditorConfig }}>
        <div>
          <div className={Styles.Toolbar}>
            <Toolbar />
          </div>
          <HistoryPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className={Styles.EditorInput} />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <Autofocus />
        </div>
      </LexicalComposer>
    </div>
  );
}
