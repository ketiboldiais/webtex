import { useState } from "react";

export const useModal = (init = false) => {
  const [modalOpen, setModalOpen] = useState(init);
  const toggle = () => setModalOpen(!modalOpen);
  return [modalOpen, setModalOpen, toggle];
};
