import { useState } from 'react';

export const useModal = (init = false) => {
  const [isOpen, setIsOpen] = useState(init);
  const toggle = () => setIsOpen(!isOpen);
  return { isOpen, toggle };
};
