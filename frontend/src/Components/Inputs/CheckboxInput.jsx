// Components/Inputs/CheckboxInput.jsx
import styles from '../../Styles/Auth.module.css'

export default function CheckboxInput(props) {
    return (
        <label className={styles.checkboxLabel} htmlFor={props.id}>
            <input type="checkbox" id={props.id} onClick={props.setCheck}/>
            <span>{props.label}</span>
        </label>
    );
}