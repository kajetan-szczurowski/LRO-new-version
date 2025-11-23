 import { getDamageIcons } from "../DamageIcons";
 import { MessageResultType } from "./Chat";

export function handleRollResultValue(resultText: MessageResultType | undefined, totalValue: number | string | undefined){
   const damageIcons = getDamageIcons();
   if (!resultText) return undefined;
   if (!Array.isArray(resultText)) return resultText;
   if (!totalValue) return undefined;
   let handled = "";
   resultText.forEach(chunk => {handled = appendTextValue(handled, chunk)});
   return `${handled.slice(0, handled.length - 3)} = ${totalValue}`;


   function appendTextValue(text:string, current:[number, string]){
       return text + `${current[0]}${inputSign(current[1])} + `;
   }


   function inputSign(signText:string){
       if (!signText) return '';
       const icon = damageIcons.get(signText);
       return icon? icon : `[${signText}]`;
   }
 }


 export function isNatural(rollText: string, rollOrder: string | undefined){
   if (!rollOrder) return false;
   if (Array.isArray(rollText)) return false;
   const orderStart = rollOrder.slice(0,3);
   if (orderStart !== 'd20') return false;
   const textStart = rollText.slice(0,2);
   return textStart === '20' || textStart.trim() === '1';
 }

