import { KyberNativeMessaging } from "../src/kyberNM.js";

document.addEventListener("DOMContentLoaded", function () {
    const kyberNM = new KyberNativeMessaging();
    kyberNM.connect();

    const button = document.getElementById("button");
    button.addEventListener("click", async function () {
        const res = await kyberNM.generateKeypair();
        console.log(res);
    });
});
