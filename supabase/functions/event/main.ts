import {crypto} from "@std/crypto";

const message = "Hello, Deno!";
const encoder = new TextEncoder();
const data = encoder.encode(message);

console.log(crypto)
console.log(await crypto.subtle.digest("BLAKE3", data));
