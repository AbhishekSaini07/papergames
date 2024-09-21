import { deleteDoc, doc, updateDoc } from "firebase/firestore";

import { db } from "../config/db";
export const setFirebaseData = async (gameCode,field,value) => {
    //alert(`set date \n game is ${gameCode} field is ${field} and value is ${value}`);
    const turnRef = doc(db, "Bingo", gameCode);
    try {
        await updateDoc(turnRef, { [field]: value});
    } catch (error) {
        throw new Error("For Game " + gameCode + " " + field + " is not Updated in Firebase");
    }
};
export const deleteFirebaseDoc = async (gameCode) => {
    try {
            
           await deleteDoc(doc(db, "Bingo", gameCode));       
    } catch (error) {
        throw new Error("Game " + gameCode + " is not Ended");
    }
};