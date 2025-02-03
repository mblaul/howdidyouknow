import nodemailer from "nodemailer";
import type JSONTransport from "nodemailer/lib/json-transport";

export function getTransportOptions(): JSONTransport | JSONTransport.Options {
  if (process.env.NODE_ENV === undefined) {
    throw Error("NODE_ENV not defined for mailer config");
  }

  switch (process.env.NODE_ENV) {
    case "development":
    default: {
      return {
        jsonTransport: true,
      };
    }
  }
}

export const nodemailerTransport = nodemailer.createTransport(
  getTransportOptions(),
);
