import { createPortal } from 'react-dom';

import Styles from '@styles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  hide: () => void;
  children: JSX.Element;
}

export const Modal = ({ isOpen, hide, children }: ModalProps) =>
  isOpen
    ? createPortal(
        <>
          <div className={Styles.ModalOverlay}>
            <div className={Styles.ModalCard}>
              <div
                className={Styles.Modal}
                aria-modal
                aria-hidden
                tabIndex={-1}
                role='dialog'
              >
                <div className={Styles.ModalHeader}>
                  <button
                    type='button'
                    className={Styles.closeModalButton}
                    data-dismiss='modal'
                    aria-label='close'
                    onClick={hide}
                  >
                    <span aria-hidden>&times;</span>
                  </button>
                </div>
                <div className={Styles.ModalBody}>{children}</div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;
