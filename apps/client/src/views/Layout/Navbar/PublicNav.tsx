import { Link } from 'react-router-dom';

export const PublicNav = () => {
  return (
    <ul>
      <li>
        <Link to='/register'>Register</Link>
      </li>
      <li>
        <Link to='/login'>Login</Link>
      </li>
    </ul>
  );
};
