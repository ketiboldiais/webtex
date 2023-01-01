import { Editor } from "../../components/Editor";

// Styles
import Styles from "../../styles/Docs.module.css"

function Docs() {
  return (
    <article className={Styles.DocsContainer}>
      <section>
        <p>
          Webtex is a note-taking application geared towards technical subjects.
        </p>
        <Editor />
      </section>
      <section>
        <h2>Inline Equations</h2>
        <p>
          Inline equations are rendered with KaTeX. They start with a &#36;,
          followed by a space, and terminated with a &#36;.
        </p>
        <figure>
          <img src="/webtex_katex.gif" />
        </figure>
      </section>
    </article>
  );
}

export default Docs;
