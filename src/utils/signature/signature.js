import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import styles from "./style.module.scss";

export default function Signature({ signatureUrl, setSignatureUrl, setIsSigned }) {
  const signatureRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const clear = () => {
    signatureRef.current.clear();
    setSignatureUrl("");
    setIsSigned(false);
  };

  const save = () => {
    if (signatureRef.current.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }

    const dataURL = signatureRef.current.toDataURL("image/png");
    setSignatureUrl(dataURL);
    setIsSigned(true);
  };

  return (
    <div className={styles.signatureContainer}>
      <div className={styles.signaturePad}>
      <SignaturePad ref={signatureRef} penColor="black" style=" border: 1px solid #cecece" />
      </div>
      <button type="button" onClick={clear} className={styles.clearButton}>Réinitialiser le champ</button>
      <button type="button" onClick={save} className={styles.saveButton}>Valider la signature</button>
      {/* {signatureUrl && (
        <div className={styles.signaturePreview}>
          <img src={signatureUrl} alt="Signature Preview" />
        </div>
      )} */}
    </div>
  );
}
