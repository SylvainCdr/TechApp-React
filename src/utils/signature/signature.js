

import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import styles from "./style.module.scss";

export default function Signature({ setSignatureUrl, setIsSigned }) {
  const signatureRef = useRef(null);


  const clear = () => {
    signatureRef.current.clear();
    setSignatureUrl("");
    setIsSigned(false);
  };

  const save = () => {
    if (signatureRef.current.isEmpty()) {
      alert("Veuillez faire signer le document avant de valider.");
      return;
    }

    const dataURL = signatureRef.current.toDataURL("image/png");
    setSignatureUrl(dataURL);
    setIsSigned(true);
  };

  return (
    <div className={styles.signatureContainer}>
      <div className={styles.signaturePad}>
        <SignaturePad ref={signatureRef} penColor="black"  canvasProps={{width: 350, height: 300, className: 'sigCanvas'}} />
      </div>

      <div className={styles.buttonsSignature}> 


      <button type="button" onClick={clear} className={styles.clearButton}>Nettoyer signature</button>
      <button type="button" onClick={save} className={styles.saveButton}>Valider signature</button>
      </div>
      {/* {signatureUrl && (
        <div className={styles.signaturePreview}>
          <img src={signatureUrl} alt="Signature Preview" />
        </div>
      )} */}
    </div>
  );
}
