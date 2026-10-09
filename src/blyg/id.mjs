// Blygger item ids (spec 0.3 §5.1): 128 random bits as 26 characters of
// lowercase Crockford base32. Plain JS so scripts/new-post.mjs can share it.
import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';

export const BLYG_ID_PATTERN = /^[0-9abcdefghjkmnpqrstvwxyz]{26}$/;

export function newBlygId() {
  let n = BigInt('0x' + randomBytes(16).toString('hex'));
  let id = '';
  for (let i = 0; i < 26; i++) {
    id = ALPHABET[Number(n & 31n)] + id;
    n >>= 5n;
  }
  return id;
}
