import nodemailer from "nodemailer";
import type JSONTransport from "nodemailer/lib/json-transport";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { ENV } from "varlock/env";

export function getTransportOptions(): JSONTransport | JSONTransport.Options | SMTPTransport.Options {
  if (ENV.NODE_ENV === "production" || ENV.RESEND_API_KEY) {
    return {
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: ENV.RESEND_API_KEY,
      },
    };
  }

  return {
    jsonTransport: true,
  };
}

export const nodemailerTransport = nodemailer.createTransport(
  getTransportOptions(),
);
