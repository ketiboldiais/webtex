import { Editor } from '@components/Editor/Editor';
import { DEFAULT_NOTE } from 'src/config';

// styles
import Styles from '@styles/Workspace.module.css';

const Workspace = () => {
  const content = (
    <article className={Styles.Home}>
      <section className={Styles.Workspace}>
        <Editor init={DEFAULT_NOTE.content} privy={true} />
      </section>
    </article>
  );
  return content;
};

export default Workspace;
