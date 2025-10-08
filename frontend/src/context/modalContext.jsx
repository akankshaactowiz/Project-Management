import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [openProjectId, setOpenProjectId] = useState(null);

  const openModal = (projectId) => setOpenProjectId(projectId);
  const closeModal = () => setOpenProjectId(null);

  return (
    <ModalContext.Provider value={{ openProjectId, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
