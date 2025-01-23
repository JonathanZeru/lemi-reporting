import { FC, ReactNode, createContext, useContext, useState } from "react";

const ModalContext = createContext({
  dialogType: "",
  setDialogType: (type: string) => {
    type;
  },
});

export const useModal = () => {
  const modalCtx = useContext(ModalContext);
  return modalCtx;
};

const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogType, setDialogType] = useState<string>("");
  return (
    <ModalContext.Provider value={{ dialogType, setDialogType }}>
      {children}
    </ModalContext.Provider>
  );
};

export { ModalContext, ModalProvider };
