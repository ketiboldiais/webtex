import { useState } from "react";

export const useModal = (init = false) => {
  const [modalIsOpen, setModalIsOpen] = useState(init);
  const toggle = () => setModalIsOpen(!setModalIsOpen);
  return [modalIsOpen, setModalIsOpen, toggle];
};
