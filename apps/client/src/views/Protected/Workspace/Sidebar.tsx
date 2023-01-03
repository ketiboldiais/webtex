import Styles from '@styles/Sidebar.module.css';
import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';
import { NoteList } from '../../../client';

interface SidebarProps {}

const Sidebar = ({}: SidebarProps) => {
  return (
    <div>
      <h2>Notes</h2>
    </div>
  );
};

export default Sidebar;
