import { Editor } from '@components/Editor';
import { DEFAULT_NOTE } from 'src/config';
import { Notelist } from './Notelist';

// styles
import Styles from '@styles/Lab.module.css';

export const Lab = () => {
  return (
    <article className={Styles.LabContainer}>
      <Notelist />
      <Editor init={DEFAULT_NOTE.content} privy={true} />
    </article>
  );
};
