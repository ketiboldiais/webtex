import modal from "../ui/styles/Modal.module.scss";
import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { XBtn } from "src/chips/XBtn";

type PortalProps = {
  children: ReactNode;
  closeOnClickOutside: boolean;
  onClose: () => void;
  title: string;
};

/**
 * Portal container for rendering
 * the modal above everything else.
 * Note: All this does is change the
 * physical placement of the modal
 * with respect to the DOM node.
 * The modal is still a child node
 * of the parent container.
 */
function PortalImpl({
  children,
  closeOnClickOutside,
  onClose,
  title,
}: PortalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current !== null) ref.current.focus();
  }, []);
  useEffect(() => {
    let overlay: HTMLElement | null = null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (ref.current === null) return;
      if (!ref.current.contains(target as Node)) return;
      if (!closeOnClickOutside) return;
      onClose();
    };
    const cleanup = () => {
      window.removeEventListener("keydown", handler);
      overlay?.removeEventListener(
        "click",
        clickOutsideHandler,
      );
    };
    const modalElement = ref.current;
    if (modalElement === null) return cleanup;
    overlay = modalElement.parentElement;
    if (overlay === null) return cleanup;
    overlay.addEventListener("click", clickOutsideHandler);
    window.addEventListener("keydown", handler);
    return cleanup;
  }, [closeOnClickOutside, onClose]);
  return (
    <div className={modal.overlay}>
      <div className={modal.main} tabIndex={-1} ref={ref}>
        <h2 className={modal.title}>{title}</h2>
        {/* <button className={modal.close} onClick={onClose}>&times;</button> */}
        <XBtn className={modal.close} onClose={onClose}/>
        <div className={modal.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalBox(
  { children, title, ref = null, onClose }: {
    children: ReactNode;
    title: string;
    ref: RefObject<HTMLDivElement> | null;
    onClose?: () => void;
  },
) {
  return (
    <div className={modal.overlay}>
      <div className={modal.main} tabIndex={-1} ref={ref}>
        <h2 className={modal.title}>{title}</h2>
        {/* <button className={modal.close} onClick={onClose}>&times;</button> */}
        <XBtn onClose={onClose} className={modal.close}/>
        <div className={modal.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}: {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: () => void;
  title: string;
}) {
  return createPortal(
    <PortalImpl
      onClose={onClose}
      title={title}
      closeOnClickOutside={closeOnClickOutside}
    >
      {children}
    </PortalImpl>,
    document.body,
  );
}

type ModalReturn = [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element) => void,
];
export function useModal(): ModalReturn {
  const [modalContent, setModalContent] = useState<
    null | {
      closeOnClickOutside: boolean;
      content: JSX.Element;
      title: string;
    }
  >(null);

  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);
  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { title, content, closeOnClickOutside } = modalContent;
    return (
      <Modal
        onClose={onClose}
        title={title}
        closeOnClickOutside={closeOnClickOutside}
      >
        {content}
      </Modal>
    );
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (
      title: string,
      getContent: (onClose: () => void) => JSX.Element,
      closeOnClickOutside = false,
    ) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title,
      });
    },
    [onClose],
  );

  return [modal, showModal];
}
