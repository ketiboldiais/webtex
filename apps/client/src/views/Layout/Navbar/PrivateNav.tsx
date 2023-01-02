import { Link } from 'react-router-dom';
import { useSignoutMutation } from '@model/auth.api';

export const PrivateNav = () => {
  const [logout] = useSignoutMutation();
  return (
    <ul>
      <li>
        <Link to='notes'>Notes</Link>
      </li>
      <li>
        <Link to='/'>Workspace</Link>
      </li>
      <li>
        <Link to='settings'>Settings</Link>
      </li>
      <li>
        <button onClick={() => logout()}>Logout</button>
      </li>
    </ul>
  );
};
