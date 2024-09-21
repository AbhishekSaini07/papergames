import style from "./header.module.css";
import logoImg from "../../../assets/logos/logo.png";
export default function Header(){
    return (<>
    <div className={style.container}><img src= {logoImg} alt="Logo"/></div>
    </>);
}