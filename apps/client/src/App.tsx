import { Routes, Route } from 'react-router-dom';
import '@styles/App.module.css';

// pages
import { Layout } from './views/Layout/Layout';
import Main from './views/Public/Main';
import Docs from './views/Public/Docs';
import { Missing } from './views/Public/Missing';
import { Suspense } from 'react';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Main />} />
        <Route path='main' element={<Main />} />
        <Route path='docs' element={<Docs />} />
      </Route>
      <Route path='*' element={<Missing />} />
    </Routes>
  );
}

export default App;
