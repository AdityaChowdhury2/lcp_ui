import QRCode from "qrcode";

export const generateQRCodeBase64 = async (value: string) => {
    try {
        const qr = await QRCode.toDataURL(value, {
            errorCorrectionLevel: "H",
            width: 180,
            margin: 1,
        });
        return qr; // base64 string
    } catch (err) {
        console.error(err);
        return "";
    }
};