import React from "react";
import styles from "./Modal.module.css"; // Import the CSS Module

const Modal = ({ closeModal, children }) => {
  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeModal}>
          &times;
        </button>
        <div className={styles.childrenContainer}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
