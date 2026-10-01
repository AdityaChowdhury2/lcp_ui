import CryptoJS from "crypto-js";

const SECRET_KEY = "labour";
const SECRET_IV = "Lc#Nic@2015";

export const encryptionDecryptionFun
    = (action: "encrypt" | "decrypt",
        input: any
    ): string | null => {

        // sha512(secretKey) → hex → first 32 bytes
        const keyHex = CryptoJS.SHA512(SECRET_KEY).toString(CryptoJS.enc.Hex);
        const key = CryptoJS.enc.Hex.parse(keyHex.substring(0, 64));

        // sha512(secretIv) → first 16 bytes
        const ivHex = CryptoJS.SHA512(SECRET_IV).toString(CryptoJS.enc.Hex);
        const iv = CryptoJS.enc.Hex.parse(ivHex.substring(0, 32));

        if (action === "encrypt") {
            const encrypted = CryptoJS.AES.encrypt( String(input), key, {
                iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            return encrypted.toString().replace(/\//g, "_").replace(/\+/g, "-");
        }

        if (action === "decrypt") {
            try {
                let base64Input = String(input).replace(/_/g, "/").replace(/-/g, "+");
                const decrypted = CryptoJS.AES.decrypt( base64Input, key, {
                    iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7,
                });

                const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
                return decryptedStr || null;
            } catch {
                return null;
            }
        }

        return null;
    }
