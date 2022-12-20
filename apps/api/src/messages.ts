export enum message {
  success,
  missingData,
  badCredentials,
  unverifiedAccount,
  emailCannotBeUsed,
  verifyLinkSent,
  registrationFailed,
}

export interface ServerMessage {
  message: message;
}

export const MissingDataMessage: ServerMessage = {
  message: message.missingData,
};

export const BadEmailMessage: ServerMessage = {
  message: message.emailCannotBeUsed,
};

export const BadCredentialsMessage: ServerMessage = {
  message: message.badCredentials,
};

export const VerifyMessage: ServerMessage = {
  message: message.verifyLinkSent,
};

export const UnverifiedAccountMessage: ServerMessage = {
  message: message.unverifiedAccount,
};

export const RegisterFailMessage: ServerMessage = {
  message: message.registrationFailed,
};

export const SuccessMessage: ServerMessage = {
  message: message.success,
};
