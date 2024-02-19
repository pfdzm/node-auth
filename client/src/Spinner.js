import styles from "./Spinner.module.css";

export default function Spinner() {
  return (
    <div className={styles["spinner-container"]}>
      <span>Loading</span>
      <div className={styles["lds-dual-ring"]}></div>
    </div>
  );
}
