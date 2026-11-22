
import { formatMpesaPhone } from "./backend/src/services/mpesaService.js";

console.log("0712345678:", formatMpesaPhone("0712345678"));
console.log("0112345678:", formatMpesaPhone("0112345678"));
console.log("254712345678:", formatMpesaPhone("254712345678"));
console.log("+254712345678:", formatMpesaPhone("+254712345678"));
