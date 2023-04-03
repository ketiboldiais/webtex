import app from "../ui/styles/App.module.scss";
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
import { VoidFunction } from "src/App";

type PortalProps = {
  children: ReactNode;
  closeOnClickOutside: boolean;
  onClose: () => void;
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
    <div className={app.modal_overlay}>
      <div className={app.modal_main} tabIndex={-1} ref={ref}>
        <div className={app.modal_control_bar}>
          <button className={app.modal_close_button} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={app.modal_content}>
          {children}
        </div>
      </div>
    </div>
  );
}

type ModalBoxProps = {
  children: ReactNode;
  ref: RefObject<HTMLDivElement> | null;
  onClose?: () => void;
};

export function ModalBox({ children, ref = null, onClose }: ModalBoxProps) {
  return (
    <div className={app.modal_overlay}>
      <div className={app.modal_main} tabIndex={-1} ref={ref}>
        <div className={app.modal_control_bar} />
        <button className={app.modal_close_button} onClick={onClose}>
        </button>
        <div className={app.modal_content}>
          {children}
        </div>
      </div>
    </div>
  );
}

type ModalProps = {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: VoidFunction;
};

export function Modal({
  onClose,
  children,
  closeOnClickOutside = false,
}: ModalProps) {
  return createPortal(
    <PortalImpl
      onClose={onClose}
      closeOnClickOutside={closeOnClickOutside}
    >
      {children}
    </PortalImpl>,
    document.body,
  );
}

type ModalReturn = [
  JSX.Element | null,
  (showModal: (onClose: () => void) => JSX.Element) => void,
];

type ModalContent = null | {
  closeOnClickOutside: boolean;
  content: JSX.Element;
};
export function useModal(): ModalReturn {
  const [modalContent, setModalContent] = useState<ModalContent>(null);
  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);
  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { content, closeOnClickOutside } = modalContent;
    return (
      <Modal
        onClose={onClose}
        closeOnClickOutside={closeOnClickOutside}
      >
        {content}
      </Modal>
    );
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (
      getContent: (onClose: VoidFunction) => JSX.Element,
      closeOnClickOutside = false,
    ) =>
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
      }),
    [onClose],
  );

  return [modal, showModal];
}
