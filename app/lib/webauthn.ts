import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const RP_NAME = 'MyBillPort';
const RP_ID = process.env.NODE_ENV === 'production' ? 'mybillport.com' : 'localhost';
const ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://mybillport.com'
  : 'http://localhost:5000';

export function getRpId() {
  return RP_ID;
}

export function getOrigin() {
  return ORIGIN;
}

export async function createRegistrationOptions(userId: string, userName: string, userDisplayName: string) {
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName,
    userDisplayName,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required',
      authenticatorAttachment: 'platform',
    },
    timeout: 60000,
  });

  return options;
}

export async function verifyRegistration(
  response: any,
  expectedChallenge: string,
) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
  });

  return verification;
}

export async function createAuthenticationOptions(credentialId: string) {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    timeout: 60000,
    allowCredentials: [
      {
        id: credentialId,
      },
    ],
  });

  return options;
}

export async function verifyAuthentication(
  response: any,
  expectedChallenge: string,
  credentialPublicKey: Uint8Array,
  counter: number,
  credentialId: string,
) {
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
    credential: {
      id: credentialId,
      publicKey: credentialPublicKey,
      counter,
    },
  });

  return verification;
}
