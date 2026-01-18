import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const publicKey = fs.readFileSync("./certs/public.pem");

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const jwk = rsaPemToJwk(publicKey, { use: "sig" }, "public");

console.log(JSON.stringify(jwk)); 
