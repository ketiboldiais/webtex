import { Routes, Route } from "react-router-dom";
import "@styles/App.module.css";

// pages
import { Layout } from "./views/Layout/Layout";
import Register from "./views/Public/Register";
import Login from "./views/Public/Login";
import Docs from "./views/Public/Docs";
import { Missing } from "./views/Public/Missing";
import Workspace from "./views/Protected/Workspace/Workspace";
import { Settings } from "./views/Protected/Settings";
import { Protected } from "./views/Protected/Protected";
import { Notes } from "./views/Protected/Notes";
import {useAppSelector,selectLoginStatus} from "./model/store";

function App() {
  const session = useAppSelector(selectLoginStatus);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={session ? <Workspace/> : <Docs />} />
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register />} />
        <Route path="docs" element={<Docs/>}/>
        <Route element={<Protected />}>
          <Route index element={<Workspace />} />
          <Route path="notes" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
