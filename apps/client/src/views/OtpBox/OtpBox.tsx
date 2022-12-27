import Styles from "./Styles/OtpBox.module.css";

interface OtpBoxProps {
  email: string;
}

export const OtpBox = ({ email }: OtpBoxProps) => {
  return (
    <div className={Styles.OtpBoxContainer}>
      <p>Please enter the verification code sent to {email}.</p>
      <form>
        <input type="text" />
      </form>
    </div>
  );
};
