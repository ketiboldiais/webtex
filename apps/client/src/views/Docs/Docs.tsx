import { Editor } from "../../components/Editor";
import { motion } from "framer-motion";

// Styles
import Styles from "./Styles/Docs.module.css";

function Docs() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
    >
      <article className={Styles.DocsContainer}>
        <h1>Webtex</h1>
        <p>
          Webtex is a note-taking application and repository geared towards
          technical subjects.
        </p>
        <Editor />
        <h2>Inline Equations</h2>
        <section>
          <p>
            Inline equations are rendered with KaTeX. They start with a &#36;,
            followed by a space, and terminated with a &#36;.
          </p>
          <figure>
            <img src="../../public/webtex_katex.gif" />
          </figure>
        </section>
      </article>
    </motion.div>
  );
}

export default Docs;
