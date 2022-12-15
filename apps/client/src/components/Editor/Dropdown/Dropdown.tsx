import { ReactNode, useEffect, useState } from "react";
import Styles from "./Styles/Dropdown.module.css";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  chosenOption?: DropdownOption;
  onChange: (chosenOption?: DropdownOption) => void;
};

function Dropdown({ options, chosenOption, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectOption = (option: DropdownOption) => {
    if (option !== chosenOption) onChange(option);
  };
  const IsChosen = (option: DropdownOption) => {
    return option === chosenOption;
  };
  useEffect(() => {
    if (isOpen) setHighlightedIndex(0);
  }, [isOpen]);
  return (
    <div
      tabIndex={0}
      className={Styles.DropdownContainer}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <span className={Styles.ValueField}>{chosenOption?.label}</span>
      <div className={Styles.divider}></div>
      <div className={Styles.caret}></div>
      <dl className={`${Styles.optionsList} ${isOpen && Styles.show}`}>
        {options.map((option, i: number) => (
          <dt
            key={`${option.value}-${option.label}-${i}`}
            className={`${IsChosen(option) && Styles.selected} ${
              i === highlightedIndex && Styles.highlighted
            }`}
            onMouseEnter={() => setHighlightedIndex(i)}
            onClick={(event) => {
              event.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
          >
            <div className={Styles.Checkbox}>
              {IsChosen(option) && <div className={Styles.Checked}></div>}
            </div>
            {option.label}
          </dt>
        ))}
      </dl>
    </div>
  );
}

export default Dropdown;
