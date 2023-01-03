import { Lab } from '@components/Lab';

// Styles
import Styles from '@styles/Docs.module.css';

function Docs() {
  return (
    <article className={Styles.DocsContainer}>
      <section>
        <p>
          Webtex is a note-taking application geared towards technical subjects.
        </p>
      </section>
      <Lab />
    </article>
  );
}

export default Docs;
