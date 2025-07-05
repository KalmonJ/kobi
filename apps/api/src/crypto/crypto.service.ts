import { Injectable } from "@nestjs/common";
import * as CryptoJS from "crypto-js";

@Injectable()
export class CryptoService {
  encrypt(text: string): string {
    const secret: string | undefined = process.env.MESSAGE_ENCRYPTION_KEY;

    if (!secret) {
      throw new Error(
        "MESSAGE_ENCRYPTION_KEY environment variable is not set.",
      );
    }

    return CryptoJS.AES.encrypt(text, secret).toString();
  }

  decrypt(encrypted: string): string {
    const secret: string | undefined = process.env.MESSAGE_ENCRYPTION_KEY;

    if (!secret) {
      throw new Error(
        "MESSAGE_ENCRYPTION_KEY environment variable is not set.",
      );
    }

    const bytes = CryptoJS.AES.decrypt(encrypted, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
