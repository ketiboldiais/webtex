import { Editor } from "@components/Editor";

// Styles
import Styles from "@styles/Docs.module.css"

function Docs() {
  return (
    <article className={Styles.DocsContainer}>
      <section>
        <p>
          Webtex is a note-taking application geared towards technical subjects.
        </p>
        <Editor privy={false}/>
      </section>
    </article>
  );
}

export default Docs;
