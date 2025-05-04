"use strict";

/*\
|*|
|*|  :: Number.isInteger() polyfill ::
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
|*|
\*/

if (!Number.isInteger) {
  Number.isInteger = function isInteger (nVal) {
    return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
  };
}

/*\
|*|
|*|  StringView - Mozilla Developer Network
|*|
|*|  Revision #8, October 6, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays/StringView
|*|  https://developer.mozilla.org/en-US/docs/User:fusionchess
|*|
|*|  This framework is released under the GNU Lesser General Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/lgpl-3.0.html
|*|
\*/

function StringView (vInput, sEncoding /* optional (default: UTF-8) */, nOffset /* optional */, nLength /* optional */) {

  var fTAView, aWhole, aRaw, fPutOutptCode, fGetOutptChrSize, nInptLen, nStartIdx = isFinite(nOffset) ? nOffset : 0, nTranscrType = 15;

  if (sEncoding) { this.encoding = sEncoding.toString(); }

  encSwitch: switch (this.encoding) {
    case "UTF-8":
      fPutOutptCode = StringView.putUTF8CharCode;
      fGetOutptChrSize = StringView.getUTF8CharLength;
      fTAView = Uint8Array;
      break encSwitch;
    case "UTF-16":
      fPutOutptCode = StringView.putUTF16CharCode;
      fGetOutptChrSize = StringView.getUTF16CharLength;
      fTAView = Uint16Array;
      break encSwitch;
    case "UTF-32":
      fTAView = Uint32Array;
      nTranscrType &= 14;
      break encSwitch;
    default:
      /* case "ASCII", or case "BinaryString" or unknown cases */
      fTAView = Uint8Array;
      nTranscrType &= 14;
  }

  typeSwitch: switch (typeof vInput) {
    case "string":
      /* the input argument is a primitive string: a new buffer will be created. */
      nTranscrType &= 7;
      break typeSwitch;
    case "object":
      classSwitch: switch (vInput.constructor) {
        case StringView:
          /* the input argument is a stringView: a new buffer will be created. */
          nTranscrType &= 3;
          break typeSwitch;
        case String:
          /* the input argument is an objectified string: a new buffer will be created. */
          nTranscrType &= 7;
          break typeSwitch;
        case ArrayBuffer:
          /* the input argument is an arrayBuffer: the buffer will be shared. */
          aWhole = new fTAView(vInput);
          nInptLen = this.encoding === "UTF-32" ?
              vInput.byteLength >>> 2
            : this.encoding === "UTF-16" ?
              vInput.byteLength >>> 1
            :
              vInput.byteLength;
          aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
            aWhole
            : new fTAView(vInput, nStartIdx, !isFinite(nLength) ? nInptLen - nStartIdx : nLength);

          break typeSwitch;
        case Uint32Array:
        case Uint16Array:
        case Uint8Array:
          /* the input argument is a typedArray: the buffer, and possibly the array itself, will be shared. */
          fTAView = vInput.constructor;
          nInptLen = vInput.length;
          aWhole = vInput.byteOffset === 0 && vInput.length === (
            fTAView === Uint32Array ?
              vInput.buffer.byteLength >>> 2
            : fTAView === Uint16Array ?
              vInput.buffer.byteLength >>> 1
            :
              vInput.buffer.byteLength
          ) ? vInput : new fTAView(vInput.buffer);
          aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
            vInput
            : vInput.subarray(nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);

          break typeSwitch;
        default:
          /* the input argument is an array or another serializable object: a new typedArray will be created. */
          aWhole = new fTAView(vInput);
          nInptLen = aWhole.length;
          aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
            aWhole
            : aWhole.subarray(nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);
      }
      break typeSwitch;
    default:
      /* the input argument is a number, a boolean or a function: a new typedArray will be created. */
      aWhole = aRaw = new fTAView(Number(vInput) || 0);

  }

  if (nTranscrType < 8) {

    var vSource, nOutptLen, nCharStart, nCharEnd, nEndIdx, fGetInptChrSize, fGetInptChrCode;

    if (nTranscrType & 4) { /* input is string */

      vSource = vInput;
      nOutptLen = nInptLen = vSource.length;
      nTranscrType ^= this.encoding === "UTF-32" ? 0 : 2;
      /* ...or...: nTranscrType ^= Number(this.encoding !== "UTF-32") << 1; */
      nStartIdx = nCharStart = nOffset ? Math.max((nOutptLen + nOffset) % nOutptLen, 0) : 0;
      nEndIdx = nCharEnd = (Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0) + nStartIdx, nOutptLen) : nOutptLen) - 1;

    } else { /* input is stringView */

      vSource = vInput.rawData;
      nInptLen = vInput.makeIndex();
      nStartIdx = nCharStart = nOffset ? Math.max((nInptLen + nOffset) % nInptLen, 0) : 0;
      nOutptLen = Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0), nInptLen - nCharStart) : nInptLen;
      nEndIdx = nCharEnd = nOutptLen + nCharStart;

      if (vInput.encoding === "UTF-8") {
        fGetInptChrSize = StringView.getUTF8CharLength;
        fGetInptChrCode = StringView.loadUTF8CharCode;
      } else if (vInput.encoding === "UTF-16") {
        fGetInptChrSize = StringView.getUTF16CharLength;
        fGetInptChrCode = StringView.loadUTF16CharCode;
      } else {
        nTranscrType &= 1;
      }

    }

    if (nOutptLen === 0 || nTranscrType < 4 && vSource.encoding === this.encoding && nCharStart === 0 && nOutptLen === nInptLen) {

      /* the encoding is the same, the length too and the offset is 0... or the input is empty! */

      nTranscrType = 7;

    }

    conversionSwitch: switch (nTranscrType) {

      case 0:

      /* both the source and the new StringView have a fixed-length encoding... */

        aWhole = new fTAView(nOutptLen);
        for (var nOutptIdx = 0; nOutptIdx < nOutptLen; aWhole[nOutptIdx] = vSource[nStartIdx + nOutptIdx++]);
        break conversionSwitch;

      case 1:

      /* the source has a fixed-length encoding but the new StringView has a variable-length encoding... */

        /* mapping... */

        nOutptLen = 0;

        for (var nInptIdx = nStartIdx; nInptIdx < nEndIdx; nInptIdx++) {
          nOutptLen += fGetOutptChrSize(vSource[nInptIdx]);
        }

        aWhole = new fTAView(nOutptLen);

        /* transcription of the source... */

        for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx++) {
          nOutptIdx = fPutOutptCode(aWhole, vSource[nInptIdx], nOutptIdx);
        }

        break conversionSwitch;

      case 2:

      /* the source has a variable-length encoding but the new StringView has a fixed-length encoding... */

        /* mapping... */

        nStartIdx = 0;

        var nChrCode;

        for (nChrIdx = 0; nChrIdx < nCharStart; nChrIdx++) {
          nChrCode = fGetInptChrCode(vSource, nStartIdx);
          nStartIdx += fGetInptChrSize(nChrCode);
        }

        aWhole = new fTAView(nOutptLen);

        /* transcription of the source... */

        for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode), nOutptIdx++) {
          nChrCode = fGetInptChrCode(vSource, nInptIdx);
          aWhole[nOutptIdx] = nChrCode;
        }

        break conversionSwitch;

      case 3:

      /* both the source and the new StringView have a variable-length encoding... */

        /* mapping... */

        nOutptLen = 0;

        var nChrCode;

        for (var nChrIdx = 0, nInptIdx = 0; nChrIdx < nCharEnd; nInptIdx += fGetInptChrSize(nChrCode)) {
          nChrCode = fGetInptChrCode(vSource, nInptIdx);
          if (nChrIdx === nCharStart) { nStartIdx = nInptIdx; }
          if (++nChrIdx > nCharStart) { nOutptLen += fGetOutptChrSize(nChrCode); }
        }

        aWhole = new fTAView(nOutptLen);

        /* transcription... */

        for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode)) {
          nChrCode = fGetInptChrCode(vSource, nInptIdx);
          nOutptIdx = fPutOutptCode(aWhole, nChrCode, nOutptIdx);
        }

        break conversionSwitch;

      case 4:

      /* DOMString to ASCII or BinaryString or other unknown encodings */

        aWhole = new fTAView(nOutptLen);

        /* transcription... */

        for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
          aWhole[nIdx] = vSource.charCodeAt(nIdx) & 0xff;
        }

        break conversionSwitch;

      case 5:

      /* DOMString to UTF-8 or to UTF-16 */

        /* mapping... */

        nOutptLen = 0;

        for (var nMapIdx = 0; nMapIdx < nInptLen; nMapIdx++) {
          if (nMapIdx === nCharStart) { nStartIdx = nOutptLen; }
          nOutptLen += fGetOutptChrSize(vSource.charCodeAt(nMapIdx));
          if (nMapIdx === nCharEnd) { nEndIdx = nOutptLen; }
        }

        aWhole = new fTAView(nOutptLen);

        /* transcription... */

        for (var nOutptIdx = 0, nChrIdx = 0; nOutptIdx < nOutptLen; nChrIdx++) {
          nOutptIdx = fPutOutptCode(aWhole, vSource.charCodeAt(nChrIdx), nOutptIdx);
        }

        break conversionSwitch;

      case 6:

      /* DOMString to UTF-32 */

        aWhole = new fTAView(nOutptLen);

        /* transcription... */

        for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
          aWhole[nIdx] = vSource.charCodeAt(nIdx);
        }

        break conversionSwitch;

      case 7:

        aWhole = new fTAView(nOutptLen ? vSource : 0);
        break conversionSwitch;

    }

    aRaw = nTranscrType > 3 && (nStartIdx > 0 || nEndIdx < aWhole.length - 1) ? aWhole.subarray(nStartIdx, nEndIdx) : aWhole;

  }

  this.buffer = aWhole.buffer;
  this.bufferView = aWhole;
  this.rawData = aRaw;

  Object.freeze(this);

}

/* CONSTRUCTOR'S METHODS */

StringView.loadUTF8CharCode = function (aChars, nIdx) {

  var nLen = aChars.length, nPart = aChars[nIdx];

  return nPart > 251 && nPart < 254 && nIdx + 5 < nLen ?
      /* (nPart - 252 << 30) may be not safe in ECMAScript! So...: */
      /* six bytes */ (nPart - 252) * 1073741824 + (aChars[nIdx + 1] - 128 << 24) + (aChars[nIdx + 2] - 128 << 18) + (aChars[nIdx + 3] - 128 << 12) + (aChars[nIdx + 4] - 128 << 6) + aChars[nIdx + 5] - 128
    : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ?
      /* five bytes */ (nPart - 248 << 24) + (aChars[nIdx + 1] - 128 << 18) + (aChars[nIdx + 2] - 128 << 12) + (aChars[nIdx + 3] - 128 << 6) + aChars[nIdx + 4] - 128
    : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ?
      /* four bytes */(nPart - 240 << 18) + (aChars[nIdx + 1] - 128 << 12) + (aChars[nIdx + 2] - 128 << 6) + aChars[nIdx + 3] - 128
    : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ?
      /* three bytes */ (nPart - 224 << 12) + (aChars[nIdx + 1] - 128 << 6) + aChars[nIdx + 2] - 128
    : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ?
      /* two bytes */ (nPart - 192 << 6) + aChars[nIdx + 1] - 128
    :
      /* one byte */ nPart;

};

StringView.putUTF8CharCode = function (aTarget, nChar, nPutAt) {

  var nIdx = nPutAt;

  if (nChar < 0x80 /* 128 */) {
    /* one byte */
    aTarget[nIdx++] = nChar;
  } else if (nChar < 0x800 /* 2048 */) {
    /* two bytes */
    aTarget[nIdx++] = 0xc0 /* 192 */ + (nChar >>> 6);
    aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
  } else if (nChar < 0x10000 /* 65536 */) {
    /* three bytes */
    aTarget[nIdx++] = 0xe0 /* 224 */ + (nChar >>> 12);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
  } else if (nChar < 0x200000 /* 2097152 */) {
    /* four bytes */
    aTarget[nIdx++] = 0xf0 /* 240 */ + (nChar >>> 18);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
  } else if (nChar < 0x4000000 /* 67108864 */) {
    /* five bytes */
    aTarget[nIdx++] = 0xf8 /* 248 */ + (nChar >>> 24);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
  } else /* if (nChar <= 0x7fffffff) */ { /* 2147483647 */
    /* six bytes */
    aTarget[nIdx++] = 0xfc /* 252 */ + /* (nChar >>> 30) may be not safe in ECMAScript! So...: */ (nChar / 1073741824);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 24) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
    aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
  }

  return nIdx;

};

StringView.getUTF8CharLength = function (nChar) {
  return nChar < 0x80 ? 1 : nChar < 0x800 ? 2 : nChar < 0x10000 ? 3 : nChar < 0x200000 ? 4 : nChar < 0x4000000 ? 5 : 6;
};

StringView.loadUTF16CharCode = function (aChars, nIdx) {

  /* UTF-16 to DOMString decoding algorithm */
  var nFrstChr = aChars[nIdx];

  return nFrstChr > 0xD7BF /* 55231 */ && nIdx + 1 < aChars.length ?
    (nFrstChr - 0xD800 /* 55296 */ << 10) + aChars[nIdx + 1] + 0x2400 /* 9216 */
    : nFrstChr;

};

StringView.putUTF16CharCode = function (aTarget, nChar, nPutAt) {

  var nIdx = nPutAt;

  if (nChar < 0x10000 /* 65536 */) {
    /* one element */
    aTarget[nIdx++] = nChar;
  } else {
    /* two elements */
    aTarget[nIdx++] = 0xD7C0 /* 55232 */ + (nChar >>> 10);
    aTarget[nIdx++] = 0xDC00 /* 56320 */ + (nChar & 0x3FF /* 1023 */);
  }

  return nIdx;

};

StringView.getUTF16CharLength = function (nChar) {
  return nChar < 0x10000 ? 1 : 2;
};

/* Array of bytes to base64 string decoding */

StringView.b64ToUint6 = function (nChr) {

  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;

};

StringView.uint6ToB64 = function (nUint6) {

  return nUint6 < 26 ?
      nUint6 + 65
    : nUint6 < 52 ?
      nUint6 + 71
    : nUint6 < 62 ?
      nUint6 - 4
    : nUint6 === 62 ?
      43
    : nUint6 === 63 ?
      47
    :
      65;

};

/* Base64 string to array encoding */

StringView.bytesToBase64 = function (aBytes) {

  var sB64Enc = "";

  for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;
    if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCharCode(StringView.uint6ToB64(nUint24 >>> 18 & 63), StringView.uint6ToB64(nUint24 >>> 12 & 63), StringView.uint6ToB64(nUint24 >>> 6 & 63), StringView.uint6ToB64(nUint24 & 63));
      nUint24 = 0;
    }
  }

  return sB64Enc.replace(/A(?=A$|$)/g, "=");

};


StringView.base64ToBytes = function (sBase64, nBlockBytes) {

  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlockBytes ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockBytes) * nBlockBytes : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= StringView.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;
    }
  }

  return aBytes;

};

StringView.makeFromBase64 = function (sB64Inpt, sEncoding, nByteOffset, nLength) {

  return new StringView(sEncoding === "UTF-16" || sEncoding === "UTF-32" ? StringView.base64ToBytes(sB64Inpt, sEncoding === "UTF-16" ? 2 : 4).buffer : StringView.base64ToBytes(sB64Inpt), sEncoding, nByteOffset, nLength);

};

/* DEFAULT VALUES */

StringView.prototype.encoding = "UTF-8"; /* Default encoding... */

/* INSTANCES' METHODS */

StringView.prototype.makeIndex = function (nChrLength, nStartFrom) {

  var

    aTarget = this.rawData, nChrEnd, nRawLength = aTarget.length,
    nStartIdx = nStartFrom || 0, nIdxEnd = nStartIdx, nStopAtChr = isNaN(nChrLength) ? Infinity : nChrLength;

  if (nChrLength + 1 > aTarget.length) { throw new RangeError("StringView.prototype.makeIndex - The offset can\'t be major than the length of the array - 1."); }

  switch (this.encoding) {

    case "UTF-8":

      var nPart;

      for (nChrEnd = 0; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
        nPart = aTarget[nIdxEnd];
        nIdxEnd += nPart > 251 && nPart < 254 && nIdxEnd + 5 < nRawLength ? 6
          : nPart > 247 && nPart < 252 && nIdxEnd + 4 < nRawLength ? 5
          : nPart > 239 && nPart < 248 && nIdxEnd + 3 < nRawLength ? 4
          : nPart > 223 && nPart < 240 && nIdxEnd + 2 < nRawLength ? 3
          : nPart > 191 && nPart < 224 && nIdxEnd + 1 < nRawLength ? 2
          : 1;
      }

      break;

    case "UTF-16":

      for (nChrEnd = nStartIdx; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
        nIdxEnd += aTarget[nIdxEnd] > 0xD7BF /* 55231 */ && nIdxEnd + 1 < aTarget.length ? 2 : 1;
      }

      break;

    default:

      nIdxEnd = nChrEnd = isFinite(nChrLength) ? nChrLength : nRawLength - 1;

  }

  if (nChrLength) { return nIdxEnd; }

  return nChrEnd;

};

StringView.prototype.toBase64 = function (bWholeBuffer) {

  return StringView.bytesToBase64(
    bWholeBuffer ?
      (
        this.bufferView.constructor === Uint8Array ?
          this.bufferView
        :
          new Uint8Array(this.buffer)
      )
    : this.rawData.constructor === Uint8Array ?
      this.rawData
    :
      new Uint8Array(this.buffer, this.rawData.byteOffset, this.rawData.length << (this.rawData.constructor === Uint16Array ? 1 : 2))
    );

};

StringView.prototype.subview = function (nCharOffset /* optional */, nCharLength /* optional */) {

  var

    nChrLen, nCharStart, nStrLen, bVariableLen = this.encoding === "UTF-8" || this.encoding === "UTF-16",
    nStartOffset = nCharOffset, nStringLength, nRawLen = this.rawData.length;

  if (nRawLen === 0) {
    return new StringView(this.buffer, this.encoding);
  }

  nStringLength = bVariableLen ? this.makeIndex() : nRawLen;
  nCharStart = nCharOffset ? Math.max((nStringLength + nCharOffset) % nStringLength, 0) : 0;
  nStrLen = Number.isInteger(nCharLength) ? Math.max(nCharLength, 0) + nCharStart > nStringLength ? nStringLength - nCharStart : nCharLength : nStringLength;

  if (nCharStart === 0 && nStrLen === nStringLength) { return this; }

  if (bVariableLen) {
    nStartOffset = this.makeIndex(nCharStart);
    nChrLen = this.makeIndex(nStrLen, nStartOffset) - nStartOffset;
  } else {
    nStartOffset = nCharStart;
    //nChrLen = nStrLen - nCharStart;  // this can generate a negative length which blows up StringView ctor with Array index out of bounds error
    nChrLen = nCharLength - nCharStart;
  }

  if (this.encoding === "UTF-16") {
    nStartOffset <<= 1;
  } else if (this.encoding === "UTF-32") {
    nStartOffset <<= 2;
  }

  return new StringView(this.buffer, this.encoding, nStartOffset, nChrLen);

};

StringView.prototype.forEachChar = function (fCallback, oThat, nChrOffset, nChrLen) {

  var aSource = this.rawData, nRawEnd, nRawIdx;

  if (this.encoding === "UTF-8" || this.encoding === "UTF-16") {

    var fGetInptChrSize, fGetInptChrCode;

    if (this.encoding === "UTF-8") {
      fGetInptChrSize = StringView.getUTF8CharLength;
      fGetInptChrCode = StringView.loadUTF8CharCode;
    } else if (this.encoding === "UTF-16") {
      fGetInptChrSize = StringView.getUTF16CharLength;
      fGetInptChrCode = StringView.loadUTF16CharCode;
    }

    nRawIdx = isFinite(nChrOffset) ? this.makeIndex(nChrOffset) : 0;
    nRawEnd = isFinite(nChrLen) ? this.makeIndex(nChrLen, nRawIdx) : aSource.length;

    for (var nChrCode, nChrIdx = 0; nRawIdx < nRawEnd; nChrIdx++) {
      nChrCode = fGetInptChrCode(aSource, nRawIdx);
      fCallback.call(oThat || null, nChrCode, nChrIdx, nRawIdx, aSource);
      nRawIdx += fGetInptChrSize(nChrCode);
    }

  } else {

    nRawIdx = isFinite(nChrOffset) ? nChrOffset : 0;
    nRawEnd = isFinite(nChrLen) ? nChrLen + nRawIdx : aSource.length;

    for (nRawIdx; nRawIdx < nRawEnd; nRawIdx++) {
      fCallback.call(oThat || null, aSource[nRawIdx], nRawIdx, nRawIdx, aSource);
    }

  }

};

StringView.prototype.valueOf = StringView.prototype.toString = function () {

  if (this.encoding !== "UTF-8" && this.encoding !== "UTF-16") {
    /* ASCII, UTF-32 or BinaryString to DOMString */
    return String.fromCharCode.apply(null, this.rawData);
  }

  var fGetCode, fGetIncr, sView = "";

  if (this.encoding === "UTF-8") {
    fGetIncr = StringView.getUTF8CharLength;
    fGetCode = StringView.loadUTF8CharCode;
  } else if (this.encoding === "UTF-16") {
    fGetIncr = StringView.getUTF16CharLength;
    fGetCode = StringView.loadUTF16CharCode;
  }

  for (var nChr, nLen = this.rawData.length, nIdx = 0; nIdx < nLen; nIdx += fGetIncr(nChr)) {
    nChr = fGetCode(this.rawData, nIdx);
    sView += String.fromCharCode(nChr);
  }

  return sView;

};
define('ace/mode/waves', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var WavesHighlightRules = require("ace/mode/waves_highlight_rules").WavesHighlightRules;

    var Mode = function() {
        this.HighlightRules = WavesHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function() {
            // Extra logic goes here. (see below)
            this.getNextLineIndent = function(state, line, tab) {
                var indent = this.$getIndent(line);

                var tokenizedLine = this.getTokenizer().getLineTokens(line, state);

                var tokens = tokenizedLine.tokens;

                if (tokens.length && tokens[tokens.length - 1].type == "comment") {
                    return indent;
                }

                if (state == "start") {
                    var colonMatch = line.match(/^.*[:]\s*$/);
                    var dataMatch=line.match(/^.*[.]data\s*$/);
                    if (colonMatch) {
                        indent += tab;
                    }
                    else if(dataMatch){
                        indent +=tab
                    }
                    /*else if(dataMatch){
                        indent +=tab
                        indent+="\n.end"
                    }*/
                }

                return indent;
            };
            window.mode=this;

        }).call(Mode.prototype);
    exports.Mode = Mode;
});
define('ace/mode/waves_highlight_rules', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var WavesHighlightRules = function() {

        this.$rules = {
            "start": [
                /*                   {
                                       token: 'entity.name.function.assembly',
                                       regex: "\\.[\\w._]+"
                                   },*/
                {
                    token: "constant.language.escape",
                    regex: /\$[\w\d]+/
                },

                {
                    token: "constant.language.boolean",
                    regex: /(?:true|false)\b/
                },
                { //Comments
                    token: 'comment.assembly',
                    regex: ';.*$'
                }, { //String
                    token: "string", // " string
                    regex: '".*?"'
                },
                { //Char
                    token: "string", // " string
                    regex: "'.'"
                },
                { //Registers
                    token: 'variable.parameter.register.assembly',
                    regex: 'r[0-9]+',
                    caseInsensitive: true
                },
                { //All opcodes
                    token: 'keyword.control.assembly',
                    regex: "\\b(call|system|add|sub|mul|div|goto|iconst|result|get|load|store|return|if-eq|if-neq|if-lt|if-gt|move)\\b",
                    caseInsensitive: true
                },
                { //All directives
                    token: 'support.function.directive.assembly',
                    regex: "\\.(?:data|end|include|string|int|string|char)",
                    //regex: '\\b(?:data|end|include|string|int|string|char)\\b',
                    caseInsensitive: true
                },
                { //Local labels
                    token: 'entity.name.function.assembly',
                    regex: "\\.[\\w._]+"
                },
                //e.g main:
                { token: 'entity.name.function.assembly', regex: '^[\\w.]+?:' },
                { token: 'entity.name.function.assembly', regex: '[\\w.]+?:$' },
                {
                    token: 'constant.language',
                    regex: "(printStr|alloc|printInt|printChar|newline|cls|input)"
                },
                { //Number
                    token: 'constant.character.decimal.assembly',
                    regex: '\\b[0-9]+\\b'
                },
                {
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b0x[A-F0-9]+\\b',
                    caseInsensitive: true
                },
                {
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b[A-F0-9]+h\\b',
                    caseInsensitive: true
                }
            ]
        }
        //this.addRules(newRules, "waves-");
    }

    oop.inherits(WavesHighlightRules, TextHighlightRules);

    exports.WavesHighlightRules = WavesHighlightRules;
});

//To set the font size
//document.getElementById('editor').style.fontSize='20px';

/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
    var parser = {trace: function trace(){},
    yy: {},
    symbols_: {"error":2,"file":3,"EOF":4,"data_block":5,"include_list":6,"routine_list":7,"routine":8,"Identifier":9,":":10,"Empty":11,"program_list":12,"program":13,"local_label":14,"arithmetic_instr":15,"branch_instr":16,"assign_instr":17,"memory_instr":18,"conditional_instr":19,"GOTO_OP":20,".":21,"CALL_OP":22,"opn_comma":23,"Register":24,"Reg_Range":25,"SYSTEM_OP":26,"Integer_Constant":27,"ADD_OP":28,"SUB_OP":29,"MUL_OP":30,"DIV_OP":31,"IF_EQ_OP":32,"IF_NEQ_OP":33,"IF_GT_OP":34,"IF_LT_OP":35,"GET_OP":36,"STORE_OP":37,"[":38,"]":39,"LOAD_OP":40,"MOVE_OP":41,"RETURN_OP":42,"RESULT_OP":43,"ICONST_OP":44,"-":45,",":46,"include_block":47,"INCLUDE":48,"String_Constant":49,"DATA":50,"END":51,"const_block":52,"const_declare":53,"STRING":54,"INT":55,"CHAR":56,"Char_Constant":57,"$accept":0,"$end":1},
    terminals_: {2:"error",4:"EOF",9:"Identifier",10:":",20:"GOTO_OP",21:".",22:"CALL_OP",24:"Register",26:"SYSTEM_OP",27:"Integer_Constant",28:"ADD_OP",29:"SUB_OP",30:"MUL_OP",31:"DIV_OP",32:"IF_EQ_OP",33:"IF_NEQ_OP",34:"IF_GT_OP",35:"IF_LT_OP",36:"GET_OP",37:"STORE_OP",38:"[",39:"]",40:"LOAD_OP",41:"MOVE_OP",42:"RETURN_OP",43:"RESULT_OP",44:"ICONST_OP",45:"-",46:",",48:"INCLUDE",49:"String_Constant",50:"DATA",51:"END",54:"STRING",55:"INT",56:"CHAR",57:"Char_Constant"},
    productions_: [0,[3,1],[3,2],[3,2],[3,2],[3,3],[3,3],[3,3],[3,4],[7,1],[7,2],[8,3],[8,3],[12,1],[12,1],[12,2],[12,2],[13,1],[13,1],[13,1],[13,1],[13,1],[16,3],[16,2],[16,4],[16,4],[16,2],[16,4],[16,4],[15,6],[15,6],[15,6],[15,6],[19,7],[19,7],[19,7],[19,7],[18,4],[18,6],[18,6],[18,4],[18,2],[18,1],[18,2],[17,4],[17,4],[14,3],[25,3],[11,0],[23,1],[23,1],[6,1],[6,2],[47,3],[5,4],[5,5],[52,1],[52,2],[53,4],[53,4],[53,4]],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
    /**/) {
    /* this == yyval */
    
    var $0 = $$.length - 1;
    switch (yystate) {
    case 1:return []; 
    break;
    case 2:return [app.data_block($$[$0-1])];
    break;
    case 3:return [app.include_list($$[$0-1])];
    break;
    case 4:
              return [app.routine_list($$[$0-1])];
            
    break;
    case 5:
                return [app.include_list($$[$0-2]), app.data_block($$[$0-1])];
    
              
    break;
    case 6:
            return [app.data_block($$[$0-2]),app.routine_list($$[$0-1])];
         
    break;
    case 7:
                return [app.include_list($$[$0-2]),app.routine_list($$[$0-1])];
    
              
    break;
    case 8:
           return [app.include_list($$[$0-3]),app.data_block($$[$0-2]),app.routine_list($$[$0-1])];
    
              
    break;
    case 9:this.$=[$$[$0]];
    break;
    case 10:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
    break;
    case 11:this.$=this.$=app.routine($$[$0-2],[],this._$);
    break;
    case 12:this.$=this.$=app.routine($$[$0-2],$$[$0],this._$);
    break;
    case 13:this.$=[$$[$0]];
    break;
    case 14:this.$=[$$[$0]];
    break;
    case 15:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
    break;
    case 16:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
    break;
    case 22:this.$=app.program($$[$0-2],[$$[$0]],this._$);
    break;
    case 23:this.$=app.program($$[$0-1],[$$[$0],null],this._$);
    break;
    case 24:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 25:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 26:this.$=app.program($$[$0-1],[$$[$0],null],this._$);
    break;
    case 27:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 28:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 29:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
    break;
    case 30:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
    break;
    case 31:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
    break;
    case 32:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
    break;
    case 33:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
    break;
    case 34:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
    break;
    case 35:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
    break;
    case 36:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
    break;
    case 37:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 38:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-1]],this._$);
    break;
    case 39:this.$=app.program($$[$0-5],[$$[$0-3],$$[$0]],this._$);
    break;
    case 40:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 41:this.$=app.program($$[$0-1],[$$[$0]],this._$);
    break;
    case 42:this.$=app.program($$[$0],[null],this._$);
    break;
    case 43:this.$=app.program($$[$0-1],[$$[$0]],this._$);
    break;
    case 44:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 45:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
    break;
    case 46:this.$={'type':'local_label','label':$$[$0-1],'info':this._$};
    break;
    case 47:this.$=[$$[$0-2],$$[$0]];
    break;
    case 51:this.$=[$$[$0]];
    break;
    case 52:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
    break;
    case 53:this.$=app.include_block($$[$0],this._$);
    break;
    case 54:this.$=[];
    break;
    case 55:this.$=$$[$0-2];
    break;
    case 56:this.$=[$$[$0]];
    break;
    case 57:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
    break;
    case 58:this.$= {'type':'string','name':$$[$0-1],'value':$$[$0],'info':this._$};
    break;
    case 59:this.$= {'type':'integer','name':$$[$0-1],'value':parseInt($$[$0]),'info':this._$};
    break;
    case 60:this.$= {'type':'char','name':$$[$0-1],'value':$$[$0],'info':this._$};
    break;
    }
    },
    table: [{3:1,4:[1,2],5:3,6:4,7:5,8:8,9:[1,9],21:[1,6],47:7},{1:[3]},{1:[2,1]},{4:[1,10],7:11,8:8,9:[1,9]},{4:[1,12],5:13,7:14,8:8,9:[1,9],21:[1,6],47:15},{4:[1,16],8:17,9:[1,9]},{48:[1,19],50:[1,18]},{4:[2,51],9:[2,51],21:[2,51]},{4:[2,9],9:[2,9]},{10:[1,20]},{1:[2,2]},{4:[1,21],8:17,9:[1,9]},{1:[2,3]},{4:[1,22],7:23,8:8,9:[1,9]},{4:[1,24],8:17,9:[1,9]},{4:[2,52],9:[2,52],21:[2,52]},{1:[2,4]},{4:[2,10],9:[2,10]},{21:[1,25],52:26,53:27},{49:[1,28]},{4:[2,48],9:[2,48],11:29,12:30,13:31,14:32,15:33,16:34,17:35,18:36,19:37,20:[1,43],21:[1,38],22:[1,44],26:[1,45],28:[1,39],29:[1,40],30:[1,41],31:[1,42],32:[1,53],33:[1,54],34:[1,55],35:[1,56],36:[1,47],37:[1,48],40:[1,49],41:[1,50],42:[1,51],43:[1,52],44:[1,46]},{1:[2,6]},{1:[2,5]},{4:[1,57],8:17,9:[1,9]},{1:[2,7]},{51:[1,58],54:[1,59],55:[1,60],56:[1,61]},{21:[1,62],53:63},{21:[2,56]},{4:[2,53],9:[2,53],21:[2,53]},{4:[2,11],9:[2,11]},{4:[2,12],9:[2,12],13:64,14:65,15:33,16:34,17:35,18:36,19:37,20:[1,43],21:[1,38],22:[1,44],26:[1,45],28:[1,39],29:[1,40],30:[1,41],31:[1,42],32:[1,53],33:[1,54],34:[1,55],35:[1,56],36:[1,47],37:[1,48],40:[1,49],41:[1,50],42:[1,51],43:[1,52],44:[1,46]},{4:[2,13],9:[2,13],20:[2,13],21:[2,13],22:[2,13],26:[2,13],28:[2,13],29:[2,13],30:[2,13],31:[2,13],32:[2,13],33:[2,13],34:[2,13],35:[2,13],36:[2,13],37:[2,13],40:[2,13],41:[2,13],42:[2,13],43:[2,13],44:[2,13]},{4:[2,14],9:[2,14],20:[2,14],21:[2,14],22:[2,14],26:[2,14],28:[2,14],29:[2,14],30:[2,14],31:[2,14],32:[2,14],33:[2,14],34:[2,14],35:[2,14],36:[2,14],37:[2,14],40:[2,14],41:[2,14],42:[2,14],43:[2,14],44:[2,14]},{4:[2,17],9:[2,17],20:[2,17],21:[2,17],22:[2,17],26:[2,17],28:[2,17],29:[2,17],30:[2,17],31:[2,17],32:[2,17],33:[2,17],34:[2,17],35:[2,17],36:[2,17],37:[2,17],40:[2,17],41:[2,17],42:[2,17],43:[2,17],44:[2,17]},{4:[2,18],9:[2,18],20:[2,18],21:[2,18],22:[2,18],26:[2,18],28:[2,18],29:[2,18],30:[2,18],31:[2,18],32:[2,18],33:[2,18],34:[2,18],35:[2,18],36:[2,18],37:[2,18],40:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18]},{4:[2,19],9:[2,19],20:[2,19],21:[2,19],22:[2,19],26:[2,19],28:[2,19],29:[2,19],30:[2,19],31:[2,19],32:[2,19],33:[2,19],34:[2,19],35:[2,19],36:[2,19],37:[2,19],40:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19]},{4:[2,20],9:[2,20],20:[2,20],21:[2,20],22:[2,20],26:[2,20],28:[2,20],29:[2,20],30:[2,20],31:[2,20],32:[2,20],33:[2,20],34:[2,20],35:[2,20],36:[2,20],37:[2,20],40:[2,20],41:[2,20],42:[2,20],43:[2,20],44:[2,20]},{4:[2,21],9:[2,21],20:[2,21],21:[2,21],22:[2,21],26:[2,21],28:[2,21],29:[2,21],30:[2,21],31:[2,21],32:[2,21],33:[2,21],34:[2,21],35:[2,21],36:[2,21],37:[2,21],40:[2,21],41:[2,21],42:[2,21],43:[2,21],44:[2,21]},{9:[1,66]},{24:[1,67]},{24:[1,68]},{24:[1,69]},{24:[1,70]},{21:[1,71]},{9:[1,72]},{27:[1,73]},{24:[1,74]},{24:[1,75]},{24:[1,76]},{38:[1,77]},{24:[1,78]},{4:[2,42],9:[2,42],20:[2,42],21:[2,42],22:[2,42],24:[1,79],26:[2,42],28:[2,42],29:[2,42],30:[2,42],31:[2,42],32:[2,42],33:[2,42],34:[2,42],35:[2,42],36:[2,42],37:[2,42],40:[2,42],41:[2,42],42:[2,42],43:[2,42],44:[2,42]},{24:[1,80]},{24:[1,81]},{24:[1,82]},{24:[1,83]},{24:[1,84]},{1:[2,8]},{4:[2,54],9:[2,54]},{9:[1,85]},{9:[1,86]},{9:[1,87]},{51:[1,88],54:[1,59],55:[1,60],56:[1,61]},{21:[2,57]},{4:[2,15],9:[2,15],20:[2,15],21:[2,15],22:[2,15],26:[2,15],28:[2,15],29:[2,15],30:[2,15],31:[2,15],32:[2,15],33:[2,15],34:[2,15],35:[2,15],36:[2,15],37:[2,15],40:[2,15],41:[2,15],42:[2,15],43:[2,15],44:[2,15]},{4:[2,16],9:[2,16],20:[2,16],21:[2,16],22:[2,16],26:[2,16],28:[2,16],29:[2,16],30:[2,16],31:[2,16],32:[2,16],33:[2,16],34:[2,16],35:[2,16],36:[2,16],37:[2,16],40:[2,16],41:[2,16],42:[2,16],43:[2,16],44:[2,16]},{10:[1,89]},{11:91,23:90,24:[2,48],46:[1,92]},{11:91,23:93,24:[2,48],46:[1,92]},{11:91,23:94,24:[2,48],46:[1,92]},{11:91,23:95,24:[2,48],46:[1,92]},{9:[1,96]},{4:[2,23],9:[2,23],11:91,20:[2,23],21:[2,23],22:[2,23],23:97,24:[2,48],26:[2,23],28:[2,23],29:[2,23],30:[2,23],31:[2,23],32:[2,23],33:[2,23],34:[2,23],35:[2,23],36:[2,23],37:[2,23],40:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],46:[1,92]},{4:[2,26],9:[2,26],11:91,20:[2,26],21:[2,26],22:[2,26],23:98,24:[2,48],26:[2,26],28:[2,26],29:[2,26],30:[2,26],31:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],37:[2,26],40:[2,26],41:[2,26],42:[2,26],43:[2,26],44:[2,26],46:[1,92]},{9:[2,48],11:91,23:99,27:[2,48],46:[1,92]},{9:[2,48],11:91,23:100,46:[1,92]},{11:91,23:101,38:[2,48],46:[1,92]},{24:[1,102]},{11:91,23:103,24:[2,48],46:[1,92]},{4:[2,41],9:[2,41],20:[2,41],21:[2,41],22:[2,41],26:[2,41],28:[2,41],29:[2,41],30:[2,41],31:[2,41],32:[2,41],33:[2,41],34:[2,41],35:[2,41],36:[2,41],37:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41]},{4:[2,43],9:[2,43],20:[2,43],21:[2,43],22:[2,43],26:[2,43],28:[2,43],29:[2,43],30:[2,43],31:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],37:[2,43],40:[2,43],41:[2,43],42:[2,43],43:[2,43],44:[2,43]},{11:91,23:104,24:[2,48],46:[1,92]},{11:91,23:105,24:[2,48],46:[1,92]},{11:91,23:106,24:[2,48],46:[1,92]},{11:91,23:107,24:[2,48],46:[1,92]},{49:[1,108]},{27:[1,109]},{57:[1,110]},{4:[2,55],9:[2,55]},{4:[2,46],9:[2,46],20:[2,46],21:[2,46],22:[2,46],26:[2,46],28:[2,46],29:[2,46],30:[2,46],31:[2,46],32:[2,46],33:[2,46],34:[2,46],35:[2,46],36:[2,46],37:[2,46],40:[2,46],41:[2,46],42:[2,46],43:[2,46],44:[2,46]},{24:[1,111]},{9:[2,49],21:[2,49],24:[2,49],27:[2,49],38:[2,49]},{9:[2,50],21:[2,50],24:[2,50],27:[2,50],38:[2,50]},{24:[1,112]},{24:[1,113]},{24:[1,114]},{4:[2,22],9:[2,22],20:[2,22],21:[2,22],22:[2,22],26:[2,22],28:[2,22],29:[2,22],30:[2,22],31:[2,22],32:[2,22],33:[2,22],34:[2,22],35:[2,22],36:[2,22],37:[2,22],40:[2,22],41:[2,22],42:[2,22],43:[2,22],44:[2,22]},{24:[1,115],25:116},{24:[1,117],25:118},{9:[1,120],27:[1,119]},{9:[1,121]},{38:[1,122]},{39:[1,123]},{24:[1,124]},{24:[1,125]},{24:[1,126]},{24:[1,127]},{24:[1,128]},{21:[2,58]},{21:[2,59]},{21:[2,60]},{11:91,23:129,24:[2,48],46:[1,92]},{11:91,23:130,24:[2,48],46:[1,92]},{11:91,23:131,24:[2,48],46:[1,92]},{11:91,23:132,24:[2,48],46:[1,92]},{4:[2,24],9:[2,24],20:[2,24],21:[2,24],22:[2,24],26:[2,24],28:[2,24],29:[2,24],30:[2,24],31:[2,24],32:[2,24],33:[2,24],34:[2,24],35:[2,24],36:[2,24],37:[2,24],40:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[1,133]},{4:[2,25],9:[2,25],20:[2,25],21:[2,25],22:[2,25],26:[2,25],28:[2,25],29:[2,25],30:[2,25],31:[2,25],32:[2,25],33:[2,25],34:[2,25],35:[2,25],36:[2,25],37:[2,25],40:[2,25],41:[2,25],42:[2,25],43:[2,25],44:[2,25]},{4:[2,27],9:[2,27],20:[2,27],21:[2,27],22:[2,27],26:[2,27],28:[2,27],29:[2,27],30:[2,27],31:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],37:[2,27],40:[2,27],41:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[1,133]},{4:[2,28],9:[2,28],20:[2,28],21:[2,28],22:[2,28],26:[2,28],28:[2,28],29:[2,28],30:[2,28],31:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],37:[2,28],40:[2,28],41:[2,28],42:[2,28],43:[2,28],44:[2,28]},{4:[2,44],9:[2,44],20:[2,44],21:[2,44],22:[2,44],26:[2,44],28:[2,44],29:[2,44],30:[2,44],31:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],37:[2,44],40:[2,44],41:[2,44],42:[2,44],43:[2,44],44:[2,44]},{4:[2,45],9:[2,45],20:[2,45],21:[2,45],22:[2,45],26:[2,45],28:[2,45],29:[2,45],30:[2,45],31:[2,45],32:[2,45],33:[2,45],34:[2,45],35:[2,45],36:[2,45],37:[2,45],40:[2,45],41:[2,45],42:[2,45],43:[2,45],44:[2,45]},{4:[2,37],9:[2,37],20:[2,37],21:[2,37],22:[2,37],26:[2,37],28:[2,37],29:[2,37],30:[2,37],31:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],37:[2,37],40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37]},{24:[1,134]},{11:91,23:135,24:[2,48],46:[1,92]},{4:[2,40],9:[2,40],20:[2,40],21:[2,40],22:[2,40],26:[2,40],28:[2,40],29:[2,40],30:[2,40],31:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],37:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40]},{11:91,21:[2,48],23:136,46:[1,92]},{11:91,21:[2,48],23:137,46:[1,92]},{11:91,21:[2,48],23:138,46:[1,92]},{11:91,21:[2,48],23:139,46:[1,92]},{24:[1,140]},{24:[1,141]},{24:[1,142]},{24:[1,143]},{24:[1,144]},{39:[1,145]},{24:[1,146]},{21:[1,147]},{21:[1,148]},{21:[1,149]},{21:[1,150]},{4:[2,29],9:[2,29],20:[2,29],21:[2,29],22:[2,29],26:[2,29],28:[2,29],29:[2,29],30:[2,29],31:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],37:[2,29],40:[2,29],41:[2,29],42:[2,29],43:[2,29],44:[2,29]},{4:[2,30],9:[2,30],20:[2,30],21:[2,30],22:[2,30],26:[2,30],28:[2,30],29:[2,30],30:[2,30],31:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],37:[2,30],40:[2,30],41:[2,30],42:[2,30],43:[2,30],44:[2,30]},{4:[2,31],9:[2,31],20:[2,31],21:[2,31],22:[2,31],26:[2,31],28:[2,31],29:[2,31],30:[2,31],31:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],37:[2,31],40:[2,31],41:[2,31],42:[2,31],43:[2,31],44:[2,31]},{4:[2,32],9:[2,32],20:[2,32],21:[2,32],22:[2,32],26:[2,32],28:[2,32],29:[2,32],30:[2,32],31:[2,32],32:[2,32],33:[2,32],34:[2,32],35:[2,32],36:[2,32],37:[2,32],40:[2,32],41:[2,32],42:[2,32],43:[2,32],44:[2,32]},{4:[2,47],9:[2,47],20:[2,47],21:[2,47],22:[2,47],26:[2,47],28:[2,47],29:[2,47],30:[2,47],31:[2,47],32:[2,47],33:[2,47],34:[2,47],35:[2,47],36:[2,47],37:[2,47],40:[2,47],41:[2,47],42:[2,47],43:[2,47],44:[2,47]},{4:[2,38],9:[2,38],20:[2,38],21:[2,38],22:[2,38],26:[2,38],28:[2,38],29:[2,38],30:[2,38],31:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],37:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38]},{4:[2,39],9:[2,39],20:[2,39],21:[2,39],22:[2,39],26:[2,39],28:[2,39],29:[2,39],30:[2,39],31:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],37:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39]},{9:[1,151]},{9:[1,152]},{9:[1,153]},{9:[1,154]},{4:[2,33],9:[2,33],20:[2,33],21:[2,33],22:[2,33],26:[2,33],28:[2,33],29:[2,33],30:[2,33],31:[2,33],32:[2,33],33:[2,33],34:[2,33],35:[2,33],36:[2,33],37:[2,33],40:[2,33],41:[2,33],42:[2,33],43:[2,33],44:[2,33]},{4:[2,34],9:[2,34],20:[2,34],21:[2,34],22:[2,34],26:[2,34],28:[2,34],29:[2,34],30:[2,34],31:[2,34],32:[2,34],33:[2,34],34:[2,34],35:[2,34],36:[2,34],37:[2,34],40:[2,34],41:[2,34],42:[2,34],43:[2,34],44:[2,34]},{4:[2,35],9:[2,35],20:[2,35],21:[2,35],22:[2,35],26:[2,35],28:[2,35],29:[2,35],30:[2,35],31:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],36:[2,35],37:[2,35],40:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35]},{4:[2,36],9:[2,36],20:[2,36],21:[2,36],22:[2,36],26:[2,36],28:[2,36],29:[2,36],30:[2,36],31:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],36:[2,36],37:[2,36],40:[2,36],41:[2,36],42:[2,36],43:[2,36],44:[2,36]}],
    defaultActions: {2:[2,1],10:[2,2],12:[2,3],16:[2,4],21:[2,6],22:[2,5],24:[2,7],27:[2,56],57:[2,8],63:[2,57],108:[2,58],109:[2,59],110:[2,60]},
    parseError: function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{throw new Error(str)}},
    parse: function parse(input) {
        var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
        var args = lstack.slice.call(arguments, 1);
        this.lexer.setInput(input);
        this.lexer.yy = this.yy;
        this.yy.lexer = this.lexer;
        this.yy.parser = this;
        if (typeof this.lexer.yylloc == 'undefined') {
            this.lexer.yylloc = {};
        }
        var yyloc = this.lexer.yylloc;
        lstack.push(yyloc);
        var ranges = this.lexer.options && this.lexer.options.ranges;
        if (typeof this.yy.parseError === 'function') {
            this.parseError = this.yy.parseError;
        } else {
            this.parseError = Object.getPrototypeOf(this).parseError;
        }
        function popStack(n) {
            stack.length = stack.length - 2 * n;
            vstack.length = vstack.length - n;
            lstack.length = lstack.length - n;
        }
        function lex() {
            var token;
            token = self.lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
        var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
        while (true) {
            state = stack[stack.length - 1];
            if (this.defaultActions[state]) {
                action = this.defaultActions[state];
            } else {
                if (symbol === null || typeof symbol == 'undefined') {
                    symbol = lex();
                }
                action = table[state] && table[state][symbol];
            }
                        if (typeof action === 'undefined' || !action.length || !action[0]) {
                    var errStr = '';
                    expected = [];
                    for (p in table[state]) {
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push('\'' + this.terminals_[p] + '\'');
                        }
                    }
                    if (this.lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                    } else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                    }
                    this.parseError(errStr, {
                        text: this.lexer.match,
                        token: this.terminals_[symbol] || symbol,
                        line: this.lexer.yylineno,
                        loc: yyloc,
                        expected: expected
                    });
                }
            if (action[0] instanceof Array && action.length > 1) {
                throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
            }
            switch (action[0]) {
            case 1:
                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]);
                symbol = null;
                if (!preErrorSymbol) {
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;
            case 2:
                len = this.productions_[action[1]][1];
                yyval.$ = vstack[vstack.length - len];
                yyval._$ = {
                    first_line: lstack[lstack.length - (len || 1)].first_line,
                    last_line: lstack[lstack.length - 1].last_line,
                    first_column: lstack[lstack.length - (len || 1)].first_column,
                    last_column: lstack[lstack.length - 1].last_column
                };
                if (ranges) {
                    yyval._$.range = [
                        lstack[lstack.length - (len || 1)].range[0],
                        lstack[lstack.length - 1].range[1]
                    ];
                }
                r = this.performAction.apply(yyval, [
                    yytext,
                    yyleng,
                    yylineno,
                    this.yy,
                    action[1],
                    vstack,
                    lstack
                ].concat(args));
                if (typeof r !== 'undefined') {
                    return r;
                }
                if (len) {
                    stack = stack.slice(0, -1 * len * 2);
                    vstack = vstack.slice(0, -1 * len);
                    lstack = lstack.slice(0, -1 * len);
                }
                stack.push(this.productions_[action[1]][0]);
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                stack.push(newState);
                break;
            case 3:
                return true;
            }
        }
        return true;
    }};
    /* generated by jison-lex 0.2.1 */
    var lexer = (function(){
    var lexer = {
    
    EOF:1,
    
    parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},
    
    // resets the lexer, sets new input
    setInput:function (input){this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},
    
    // consumes and returns one char from the input
    input:function (){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},
    
    // unshifts one char (or a string) into the input
    unput:function (ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},
    
    // When called from action, caches matched text and appends it on next action
    more:function (){this._more=true;return this},
    
    // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
    reject:function (){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},
    
    // retain first n characters of the match
    less:function (n){this.unput(this.match.slice(n))},
    
    // displays already matched input, i.e. for error messages
    pastInput:function (){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},
    
    // displays upcoming input, i.e. for error messages
    upcomingInput:function (){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},
    
    // displays the character position where the lexing error occurred, i.e. for error messages
    showPosition:function (){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},
    
    // test the lexed token: return FALSE when not a match, otherwise return token
    test_match:function (match,indexed_rule){var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this[k]=backup[k]}return false}return false},
    
    // return next match in input
    next:function (){if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this.options.backtrack_lexer){token=this.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this._backtrack){match=false;continue}else{return false}}else if(!this.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},
    
    // return next match that has a token
    lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},
    
    // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
    begin:function begin(condition){this.conditionStack.push(condition)},
    
    // pop the previously active lexer condition state off the condition stack
    popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},
    
    // produce the lexer rule set which is active for the currently active lexer condition state
    _currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},
    
    // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
    topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},
    
    // alias for begin(condition)
    pushState:function pushState(condition){this.begin(condition)},
    
    // return the number of states currently on the stack
    stateStackSize:function stateStackSize(){return this.conditionStack.length},
    options: {"case-insensitive":true},
    performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
    /**/) {
    
    app={};
    app.node=function(type,val){
        return {'type':type,'value':val};
    }
    app.debug=function(obj){
        console.log(JSON.stringify(obj));
    }
    app.data_block=function(val){
       return {'type':'data_block','value':val};
    }
    app.routine=function(label,val,info){
       return {'label':label,'value':val,'info':info};
    }
    app.routine_list=function(val){
        return {'type':'routine_list','value':val};
    }
    app.include_block=function(val,info){
      return {type:'include','value':val,'info':info};
    }
    app.include_list=function(val){
      return {'type':'include_list','value':val};
    }
    app.program=function(op,values,info){
     return {'type':'program','opcode':op,'operand':values,'info':info};  
    }
    app.reg=function(val){
      return {'type':'reg','value':val};
    }
    
    var YYSTATE=YY_START;
    switch($avoiding_name_collisions) {
    case 0:/* skip whitespace */
    break;
    case 1:/*Skip comments*/
    break;
    case 2:return 28;
    break;
    case 3:return 29;
    break;
    case 4:return 30;
    break;
    case 5:return 31;
    break;
    case 6:return 40;/*Load [memory location], destination register*/
    break;
    case 7:return 26;/*Call a built in routine*/
    break;
    case 8:return 22;/*Call a given routine*/
    break;
    case 9:return 43;/*Move result of function call to register*/
    break;
    case 10:return 42;/*Return from a called function*/
    break;
    case 11:return 41;/*move %sourceRegister to %destinationRegister*/
    break;
    case 12:return 44;/*Integer constant*/
    break;
    case 13:return 20;/*Goto a specific instruction*/
    break;
    case 14:return 36;/*Get the address of a constant*/
    break;
    case 15:return 37;/*Store r1,[r0] ;  store register, [destination memory location]*/
    break;
    case 16:return 32;/*If equal*/
    break;
    case 17:return 33;/*If not equal*/
    break;
    case 18:return 34;/*If greater than*/
    break;
    case 19:return 35;/*If not equal to*/
    break;
    case 20:return 50;
    break;
    case 21:return 51;
    break;
    case 22:return 'DEF';
    break;
    case 23:return 48;
    break;
    case 24:return 56;
    break;
    case 25:return 54;
    break;
    case 26:return 55;
    break;
    case 27:
                       yy_.yytext= yy_.yytext.substr( 1,yy_.yytext.length);return"Register";
                        
    break;
    case 28:return 9
    break;
    case 29:yy_.yytext= yy_.yytext.substr( 1,yy_.yytext.length - 2 );
                           yy_.yytext = yy_.yytext.replace( /''/g, "\'" ); return 49; 
    break;
    case 30:yy_.yytext= yy_.yytext.substr( 1,yy_.yytext.length - 2 );
                           yy_.yytext = yy_.yytext.replace( /''/g, "\'" ); return 57; 
    break;
    case 31:return "'";
    break;
    case 32:return '"';/*Matches a quote */
    break;
    case 33:return 27;
    break;
    case 34:return 27;
    break;
    case 35:return 38;
    break;
    case 36:return 39;
    break;
    case 37:return 21; /* Matches a dot */
    break;
    case 38:return 10; /*Matches a colon*/
    break;
    case 39:return 46;
    break;
    case 40:return 45;
    break;
    case 41:return 4;
    break;
    case 42:return 'Unknown Token'; 
    break;
    }
    },
    rules: [/^(?:[ \s])/i,/^(?:;.*)/i,/^(?:ADD\b)/i,/^(?:SUB\b)/i,/^(?:MUL\b)/i,/^(?:DIV\b)/i,/^(?:LOAD\b)/i,/^(?:SYSTEM\b)/i,/^(?:CALL\b)/i,/^(?:RESULT\b)/i,/^(?:RETURN\b)/i,/^(?:MOVE\b)/i,/^(?:ICONST\b)/i,/^(?:GOTO\b)/i,/^(?:GET\b)/i,/^(?:STORE\b)/i,/^(?:IF-EQ\b)/i,/^(?:IF-NEQ\b)/i,/^(?:IF-GT\b)/i,/^(?:IF-LT\b)/i,/^(?:DATA\b)/i,/^(?:END\b)/i,/^(?:DEF\b)/i,/^(?:INCLUDE\b)/i,/^(?:CHAR\b)/i,/^(?:STRING\b)/i,/^(?:INT\b)/i,/^(?:[rR][0-9]+)/i,/^(?:[A-Za-z_][A-Za-z0-9_]*)/i,/^(?:"([^\"]|'')*")/i,/^(?:'([^\']|'')')/i,/^(?:')/i,/^(?:")/i,/^(?:0x[0-9A-F]+)/i,/^(?:-?[0-9]+)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\.)/i,/^(?::)/i,/^(?:,)/i,/^(?:-)/i,/^(?:$)/i,/^(?:.)/i],
    conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42],"inclusive":true}}
    };
    return lexer;
    })();
    parser.lexer = lexer;
    function Parser () {
      this.yy = {};
    }
    Parser.prototype = parser;parser.Parser = Parser;
    return new Parser;
    })();
    
    
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.parser = parser;
    exports.Parser = parser.Parser;
    exports.parse = function () { return parser.parse.apply(parser, arguments); };
    exports.main = function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};
    if (typeof module !== 'undefined' && require.main === module) {
      exports.main(process.argv.slice(1));
    }
    }
    "use strict";
var SymbolTable = function() {
    var dataTable = {};
    var routineTable = {};
    var systemDataIndex = 0;//For system variables or unnamed variables
    var allDataSize = 0; //Data sizes in bytes
    SymbolTable.TYPE_DATA = 1;
    SymbolTable.TYPE_ROUTINE = 2;
    SymbolTable.DATA_TYPE_CHAR = 3;
    SymbolTable.DATA_TYPE_INT = 4;
    SymbolTable.DATA_TYPE_STRING = 5;
    return {
        //To know the type of data stored
        //Set a constant
        setData: function(key, dataType, val) {
            if (this.exists(key, SymbolTable.TYPE_DATA))
                throw new Error('Duplicate Symbol: ' + key);
            var size = 0;
            if (dataType == SymbolTable.DATA_TYPE_CHAR)
                size = 1;
            else if (dataType == SymbolTable.DATA_TYPE_INT)
                size = 4;
            else if (dataType == SymbolTable.DATA_TYPE_STRING){
                val+="\0";//Append a null variable to the end of the string
                size = val.length;
            }
            //console.error("Formal size:"+allDataSize)
            var before=allDataSize;
            //console.error("Value:"+val)
            //console.error("added size:"+size)
            //console.error("Now size:"+allDataSize)
            dataTable[key] = { type: SymbolTable.TYPE_DATA, dataType: dataType, value: val, index: allDataSize,size:size,before:before };
            allDataSize += size;
        },
        //Get the stored constant
        getData: function(key) {
            return dataTable[key];
        },
        //Get the byte index in the symbol table
        getDataIndex: function(key) {
            return dataTable[key].index;
        },
        getAllData: function() {
            return dataTable;
        },
		
		getTotalDataSize: function() {
            return allDataSize;
        },
        //Store a routine
        setRoutine: function(key, val, info) {
            if (this.exists(key, SymbolTable.TYPE_ROUTINE))
                throw new Error('Duplicate Routine: ' + key);
            routineTable[key] = { type: SymbolTable.TYPE_ROUTINE, value: val, local_labels: {}, info: info };
        },
        //Get the stored routine
        getRoutine: function(key) {
            return routineTable[key];
        },
		getAllRoutines: function() {
            return routineTable;
        },
        //Get all stored routine
        getAllRoutineNames: function(key) {
            var arr = [];
            for (var key in routineTable)
                arr.push(key);
            return arr;
        },
        //Set routine size in byte
        setRoutineSize: function(name, size) {
            routineTable[name].size = size;
        },
        //Get routine size in byte
        getRoutineSize: function(name) {
            return routineTable[name].size;
        },
        //Set routine index in byte
        setRoutineIndex: function(name, index) {
            routineTable[name].index = index;
        },
        //Get routine index in byte
        getRoutineIndex: function(name) {
            return routineTable[name].index;
        },
        //Get a local label
        getLocalLabel: function(routineName, labelName) {
            /*if(!this.exists(routineName,SymbolTable.TYPE_ROUTINE))
                throw new Error('Routine does not exists');*/
            var routineValue = this.getRoutine(routineName);
            if (routineValue)
                return routineValue.local_labels[labelName];
        },
        //Set a local label under a routine name
        setLocalLabel: function(routineName, labelName, val) {
            if (this.localLabelExist(routineName, labelName))
                throw new Error('Duplicate Local Label: ' + labelName);
            routineTable[routineName].local_labels[labelName] = val;
        },
        //Check if a local label exist
        localLabelExist: function(routineName, labelName) {
            var routineValue = this.getRoutine(routineName) || {};
            return (labelName in (routineValue.local_labels));
        },
        //Check if routine or constant exist
        exists: function(key, type) {
            if (type == SymbolTable.TYPE_DATA)
                return (key in dataTable);
            else if (type == SymbolTable.TYPE_ROUTINE)
                return (key in routineTable);
            //return (key in Table)&&type==Table[key].type;
        },
        //DataType for storing unnamed integer value in the symbol table
        newSystemData: function(value, dataType) {
            var prefix = "_";
            var suffix = '_WV';
            var dataName = prefix + (systemDataIndex++) + suffix; //New system data name
            while (this.exists(dataName, SymbolTable.TYPE_DATA))
                dataName = prefix + (systemDataIndex++) + suffix; //Choose another one
            this.setData(dataName, dataType, value);
            return dataName;
        },
        clear: function() {
            //Clear the symbol table and begin a new one
            dataTable = {};
            routineTable = {};
            systemDataIndex = 0;
            allDataSize = 0; //Data sizes in bytes
        }
    };
};
//All exception codes used in the application
var Exception = Class({
    $const: {
        PARSE_ERROR: 1,
        ASSEMBLE: 2,
        DUPLICATE_DATA: 3,
        DUPLICATE_ROUTINE: 4,
        DUPLICATE_LOCAL_LABEL: 5,
        UNKNOWN_OPERAND_TYPE: 6,
        INVALID_OPERAND_TYPE: 7,
        REG_RANGE_ERROR: 8,
        UNKNOWN_ROUTINE: 9,
        INTEGER_RANGE_ERROR: 10,
        FILE_ERROR: 11,
        UNKNOWN_LOCAL_LABEL: 12,
        UNKNOWN_OPCODE: 13,
        UNKNOWN_DATA_DFN: 14,//Unknow data definition
        INVALID_EXE:15//Invalid executable file
    }
});
var InstrBuilder = Class(
    function() {
        return {
            $statics: {
                Opcodes: {},
                Operands: {
                    Reg: 1,
                    Integer: 2,
                    Identifier: 4,
                    RegRange: 8,
                    NoReg: 16,
					Null:32
                },
                OP_MAP: {},
                get_op_code: function(name) {
                    return InstrBuilder.OP_MAP[name];
                }
            },
            constructor: function() {
                InstrBuilder.Opcodes = {
                    ADD_OP: {
                        code: 0, //The opcode number
                        size: 4, //The size of the instruction in byte
                        operand_count: 3, //The number of operand
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    SUB_OP: {
                        code: 1,
                        size: 4,//byte
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    MUL_OP: {
                        code: 2,
                        size: 4,
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    DIV_OP: {
                        code: 3,
                        size: 4,
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    ICONST_OP: {
                        code: 4,
                        size: 4,//1 byte for opcode and 1 for  reg&& 2 byte for operand index into the code
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Integer|InstrBuilder.Operands.Identifier]
                    },
                    SYSTEM_OP: {
                        code: 5,
                        size: 4,//1 byte opcode, 1 byte integer, 2 byte reg range
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Integer, InstrBuilder.Operands.Reg | InstrBuilder.Operands.RegRange | InstrBuilder.Operands.NoReg]
                    },
                    GOTO_OP: {
                        code: 6,
                        size: 2,//1 bye opcode, 1 for index into local label routine table
                        operand_count: 1,
                        operands: [InstrBuilder.Operands.Identifier]
                    },
                    CALL_OP: {
                        code: 7,
                        size: 6,//1 byte opcode, 2 identifier index, 2 register range
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Identifier, InstrBuilder.Operands.Reg | InstrBuilder.Operands.RegRange | InstrBuilder.Operands.NoReg]
                    },
                    GET_OP: {
                        code: 8,
                        size: 4,//1 bye opcode,1 for reg, 2 for index into constant table
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    LOAD_OP: {
                        code: 9,
                        size: 4,//1 bye opcode,1 for reg, 1 for reg, 1 for null
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    STORE_OP: {
                        code: 10,
                        size: 4,//1 bye opcode,1 for reg, 1 for reg, 1 for null
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    MOVE_OP: {
                        code: 11,
                        size: 4,//1 bye opcode,1 for reg, 1 for reg, 1 for null
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    RETURN_OP: {
                        code: 12,
                        size: 2,//1 bye opcode,1 for reg
                        operand_count: 1,
                        operands: [InstrBuilder.Operands.Reg|InstrBuilder.Operands.NoReg]
                    },
                    RESULT_OP: {
                        code: 13,
                        size: 2,//1 bye opcode,1 for reg
                        operand_count: 1,
                        operands: [InstrBuilder.Operands.Reg]
                    },
                    IF_EQ_OP: {
                        code: 14,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    IF_NEQ_OP: {
                        code: 15,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    IF_GT_OP: {
                        code: 16,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    IF_LT_OP: {
                        code: 17,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    }
                };
                InstrBuilder.OP_MAP = {
                    add: InstrBuilder.Opcodes.ADD_OP,
                    sub: InstrBuilder.Opcodes.SUB_OP,
                    mul: InstrBuilder.Opcodes.MUL_OP,
                    div: InstrBuilder.Opcodes.DIV_OP,
                    iconst: InstrBuilder.Opcodes.ICONST_OP,
                    system: InstrBuilder.Opcodes.SYSTEM_OP,
                    goto: InstrBuilder.Opcodes.GOTO_OP,
                    call: InstrBuilder.Opcodes.CALL_OP,
                    get:  InstrBuilder.Opcodes.GET_OP,
                    load:  InstrBuilder.Opcodes.LOAD_OP,
                    store:  InstrBuilder.Opcodes.STORE_OP,
                    move:  InstrBuilder.Opcodes.MOVE_OP,
                    return:  InstrBuilder.Opcodes.RETURN_OP,
                    result:  InstrBuilder.Opcodes.RESULT_OP,

                    "if-eq":InstrBuilder.Opcodes.IF_EQ_OP,
                    "if-neq":InstrBuilder.Opcodes.IF_NEQ_OP,
                    "if-gt":InstrBuilder.Opcodes.IF_GT_OP,
                    "if-lt":InstrBuilder.Opcodes.IF_LT_OP,
                };
            },
            //Parse a numeric value into an integer 
            parseInteger: function(val, info) {
                var num = Number(val);
                if (num > this.max_int) {
                    throw {
                        str: "Max Integer value supported reached",
                        hash: info,
                        type: Exception.INTEGER_RANGE_ERROR
                    };
                }
                var integer = num | 0; //Convert to signed integer
                return integer;
            },
            //Parse a register number
            parseReg: function(val, info) {
                var reg = Number(val);
                if (reg < 0 || reg > 0xfe) {
                    throw {
                        str: "Register should be in range r0-r254",
                        hash: info,
                        type: Exception.REG_RANGE_ERROR
                    };
                }
                return reg;
            },
            //Parse a range of registers into an int16 value
            parseRegRange: function(start, stop, info) {
                var range = this.parseReg(start, info) << 8 | this.parseReg(stop, info);
                return range;
            },
            //Convert each instruction to binary or partial binary format
            convertInstruction: function(obj) {
                this.max_int = 0xffffffff; //Max value of integer supported

                var opcode_spec = InstrBuilder.OP_MAP[obj.opcode]; //Get the specification of the opcode
                var instr = [];
                //Push the instruction
                instr.push(opcode_spec.code);
                //Push the operands


                for (var i = 0; i < opcode_spec.operand_count; i++) {
                    var operandType = opcode_spec.operands[i];
                    var operand = obj.operand[i];

                    switch (operandType) {
                        case InstrBuilder.Operands.Reg:
                            {
                                var reg = this.parseReg(operand, obj.info);
                                //Push the operand
                                instr.push(reg);
                                break;
                            }
                        case InstrBuilder.Operands.Integer:
                            {
                                var integer = this.parseInteger(operand, obj.info);
                                //Push the operand
                                instr.push(integer);
                                break;
                            }
                        case InstrBuilder.Operands.Integer|InstrBuilder.Operands.Identifier:
                            {
                                if (/^[0-9]+$/.test(operand)){
                                    instr.push(this.parseInteger(operand, obj.info));
                                }else{
                                     instr.push({name:operand,info:obj.info});
                                };
                                break;
                            }
                        case InstrBuilder.Operands.Reg | InstrBuilder.Operands.RegRange | InstrBuilder.Operands.NoReg:
                            {
                                if (operand instanceof Object) {
                                    var range = this.parseRegRange(operand[0], operand[1], obj.info);
                                } else if (operand === null) { //Instruction with no register
                                    var range = 0xff << 8 | 0xff;//Register at 0xff will not be used
                                } else {
                                    var range = this.parseRegRange(operand, operand, obj.info);
                                }
                                instr.push(range);
                                break;
                            }
                        case InstrBuilder.Operands.Reg | InstrBuilder.Operands.NoReg:
                            {
                                var reg;
                                if (operand === null) { //Instruction with no register
                                    reg = 0xff;//Register at 0xff will not be used
                                } else {
                                    reg = this.parseReg(operand,obj.info);
                                }
                                instr.push(reg);
                                break;
                            }
                        case InstrBuilder.Operands.Identifier:
                            {
                                //Don't convert yet because of other unresolved symbol
                                instr.push({ name: operand, info: obj.info });
                                break;
                            }
                        default:
                            {
                                throw {
                                    str: "Unknown Operand Type",
                                    hash: obj.info,
                                    type: Exception.UNKNOWN_OPERAND_TYPE
                                };
                            }
                    }
                }
                return instr;
            },
            validateOperand: function(str, value) {
                switch (code) {
                    case InstrBuilder.Operands.Reg:
                        {}
                }
            }
        }
    });
    /**
 * @author Israel
 */
"use strict";
var FileSystem = Class(function() {
    var host;
    var cwd = 'C://';
    var obj = {
        'file1.txt': "This is content of file1",
        'file2.txt': "This is content of file2",
        'file.asm': [
            ".data",
            ".int number 40",
            ".end",
            "mea:",
            "add r0 r0 r1"
        ].join('\n'),
        'file2.asm': [
            ".data",
            ".int number2 40",
            ".end",
            "mea2:",
            "add r0 r0 r1"
        ].join('\n'),
        'you.asm': [
            "printStr:",
            "iconst r3 40"
        ].join('\n'),
        'io.asm': [
            '.data',
            '.int newLine 10',
            '.int terminate 0',
            '.end',
            'printInt:',
            'system 0x0 r0',
            'printChar:',
            'system 0x1 r0',
            'printStr:',
            'iconst r3 terminate',
            'iconst r1 1',
            '.loop:',
            'load [r0] r2',
            'if-eq r2 r3 .stop',
            'call printChar r2',
            'add r0 r1 r0',
            'if-neq r2 r3 .loop',
            '.stop:'
        ].join('\n')
    };
    return {
        constructor: function(host) {
            this._host = host;
        },
        read: function(fname) {

            var promise = new Promise(function(resolve, reject) {
                if (fname in obj)
                    resolve(obj[fname]);
                else {
                    $.get(fname).then(function(res) {
                        resolve(res);
                    }, function() {
                        reject("No such file: " + fname);
                    });
                }

            });
            return promise;
        },
        //Set a file system with manipulated values
        define: function(fname, value) {
            obj[fname] = value;
        }
    };
});
"use strict";
var Assembler = function() {
    var fileSystem = null;
    var symbolTable = null;
    var instrBuilder = null;

    function assembleData(obj) {
        var promise = new Promise(function(resolve, reject) {
            obj.forEach(function(elem, index, obj) {
                var data = obj[index];
                try {
                    var type;
                    if (data.type == "integer")
                        type = SymbolTable.DATA_TYPE_INT;
                    else if (data.type == "char")
                        type = SymbolTable.DATA_TYPE_CHAR;
                    else if (data.type == "string")
                        type = SymbolTable.DATA_TYPE_STRING;
                    symbolTable.setData(data.name, type, data.value);
                } catch (e) {
                    throw {
                        str: e.message,
                        hash: data.info,
                        type: Exception.DUPLICATE_DATA
                    };
                }
            });
            resolve();
        });
        return promise;
    }

    function compile_routine(obj) {
        var promise = new Promise(function(resolve, reject) {
            var totalSize = 0; //Sum of the total size of all routines
            obj.forEach(function(elem, index, obj) {
                //List of the instructions
                var instrBody = [];
                //Name of the routine
                var routine_name = obj[index].label;
                var routineSize = 0;
                var instructions = obj[index].value;
                if (instructions == undefined) console.error(obj.length)
                //Try to Add a reference to instrBody to Routine symbol table
                try {
                    symbolTable.setRoutine(routine_name, instrBody, obj[index].info);
                } catch (e) {
                    var error = {
                        str: e.message,
                        hash: obj[index].info,
                        type: Exception.DUPLICATE_ROUTINE
                    };
                    reject(error);
                }

                for (var i = 0; i < instructions.length; i++) {
                    var instr = instructions[i];
                    if (instr.type == "program") {
                        //Convert the instructions into numbers
                        var convertedInstr = instrBuilder.convertInstruction(instr);
                        //Push converted instruction into the instrution list
                        instrBody.push(convertedInstr);
                        //Increment the size of the routine
                        routineSize += InstrBuilder.OP_MAP[instr.opcode].size;
                    } else {
                        //Try to set the local label
                        try {
                            var localLabelIndex=totalSize+routineSize;//The index of the local label into the code
                            symbolTable.setLocalLabel(routine_name, instr.label, localLabelIndex);
                        } catch (e) {
                            var error = {
                                str: e.message,
                                hash: obj.info,
                                type: Exception.DUPLICATE_LOCAL_LABEL
                            };
                            reject(error);
                        }
                    }

                }

                //Append a return statement to the end of every routine
                instrBody=instrBody.push([InstrBuilder.Opcodes.RETURN_OP.code, 0xff]);//No register as return
                routineSize+=InstrBuilder.Opcodes.RETURN_OP.size;//Add the size to the overall


                symbolTable.setRoutineIndex(routine_name, totalSize); //Set index of routine into the code
                totalSize += routineSize; //Increment the total routine size
                symbolTable.setRoutineSize(routine_name, routineSize);
                //this.InstrBuilder.OP_MAP[name];
                //console.log(symbolTable.getRoutine(routine_name))
                //if(routine_name=="printStr")
                 //   console.warn(symbolTable.getRoutineSize("printStr"))

            });
            resolve();
        });
        return promise;
    }

    function handleIncludes(includes) {
        var promise = new Promise(function(resolve, reject) {
            for (var i = 0; i < includes.length; i++) {
                var inc = includes[i];
                this.compile_file(inc.value).then(function(res) {
                    resolve(res);
                }, function(e) {
                    reject(e);
                });
            }
        }.bind(this));
        return promise;
    }
    //Build all routines in instruction and partially build constants
    function buildRoutine(code) {
        //The array to store binary code
        var code = [];
        //The size of the routines in byte
        var size = 0;
        //Increase the size of the instructions
        function incSize(s) {
            size += s;
        }
        //Add the routine index into the code
        function addRoutineIndex(name) {

        }
        //Get all available routine names
        var allRoutines = symbolTable.getAllRoutineNames();
        allRoutines.forEach(function(elem, index, obj) {
            //Loop over the routine names to convert it to binary
            //The first routine
            var name = allRoutines[index];
            //console.log(symbolTable.getRoutineSize(name));
            //The data of of the routine
            var routine = symbolTable.getRoutine(name);
            //The instructions in the routine
            var instructions = routine.value;
            //Loop over the instructions to convert them
            instructions.forEach(function(elem, index, instructions) {

                var instr = instructions[index];
                //code=code.concat(instr);
                var opcode = instr[0]; //First Value as opcode
                switch (opcode) {
                    case InstrBuilder.Opcodes.ADD_OP.code:
                    case InstrBuilder.Opcodes.SUB_OP.code:
                    case InstrBuilder.Opcodes.MUL_OP.code:
                    case InstrBuilder.Opcodes.DIV_OP.code:
                        {
                            code = code.concat(instr);
                            break;
                        }
                    case InstrBuilder.Opcodes.GOTO_OP.code:
                        {
                            var opcode = instr[0];
                            var localLabel = instr[1];
                            if (symbolTable.localLabelExist(name, localLabel.name)) {
                                //The index of local label into the routine
                                var index = symbolTable.getLocalLabel(name, localLabel.name);
                                code = code.concat([opcode, index]);
                            } else {
                                var error = {
                                    str: "Local label does not exist",
                                    hash: localLabel.info,
                                    type: Exception.UNKNOWN_LOCAL_LABEL
                                };
                                throw error;
                            }
                            break;
                        }
                    case InstrBuilder.Opcodes.ICONST_OP.code:
                        {
                            var opcode = instr[0];
                            var reg = instr[1];
                            var value = instr[2];
                            if (value instanceof Object) { //If it is an identifier
                                if (symbolTable.exists(value.name, SymbolTable.TYPE_DATA)) {
                                    var index = symbolTable.getDataIndex(value.name);
                                    var start = index >> 8;
                                    var end = index & 0x00ff;
                                    code = code.concat([opcode, reg, start, end]);
                                    //console.error(symbolTable.getAllData());
                                } else {
                                    var error = {
                                        str: "Data does not exist",
                                        hash: value.info,
                                        type: Exception.UNKNOWN_DATA_DFN
                                    };
                                    throw error;

                                }
                            } else {
                                //If it is of type integer
                                var dataName = symbolTable.newSystemData(value, SymbolTable.DATA_TYPE_INT);
                                var index = symbolTable.getDataIndex(dataName);
                                var start = index >> 8;
                                var end = index & 0x00ff;
                                code = code.concat([opcode, reg, start, end]);
                            }
                            break;
                        }
                    case InstrBuilder.Opcodes.SYSTEM_OP.code:
                        {
                            var opcode = instr[0];
                            var systemNo = instr[1];
                            var regRange = instr[2];
                            //Convert the int16 operand into two int8 start,end
                            var start = regRange >> 8;
                            var end = regRange & 0x00ff;
                            code = code.concat([opcode, systemNo, start, end]);
                            break;
                        }
                    case InstrBuilder.Opcodes.CALL_OP.code:
                        {
                            var opcode = instr[0];
                            var routine = instr[1];
                            if (symbolTable.exists(routine.name, SymbolTable.TYPE_ROUTINE)) {
                                var index = symbolTable.getRoutineIndex(routine.name);
                                var regRange = instr[2];
                                //Convert the int16 operand into two int8 start,end
                                var startIndex = index >> 8;
                                var endIndex = index & 0x00ff;
                                var start = regRange >> 8;
                                var end = regRange & 0x00ff;
                                code = code.concat([opcode, startIndex, endIndex, start, end, 0]); //Pad 0 to the end to satisfy 2 bytes per code
                            } else {
                                var error = {
                                    str: "Routine does not exist",
                                    hash: routine.info,
                                    type: Exception.UNKNOWN_ROUTINE
                                };
                                throw error;
                            }


                            break;
                        }
                    case InstrBuilder.Opcodes.GET_OP.code:
                        {
                            var opcode = instr[0];
                            var reg = instr[1];
                            var value = instr[2];
                            if (symbolTable.exists(value.name, SymbolTable.TYPE_DATA)) {
                                var index = symbolTable.getDataIndex(value.name);
                                var start = index >> 8;
                                var end = index & 0x00ff;
                                code = code.concat([opcode, reg, start, end]);
                                //console.error(symbolTable.getAllData());
                            } else {
                                var error = {
                                    str: "Data does not exist",
                                    hash: value.info,
                                    type: Exception.UNKNOWN_DATA_DFN
                                };
                                throw error;

                            }

                            break;
                        }
                    case InstrBuilder.Opcodes.LOAD_OP.code:
                    case InstrBuilder.Opcodes.STORE_OP.code:
                    case InstrBuilder.Opcodes.MOVE_OP.code:
                        {
                            code = code.concat(instr);
                            code=code.concat(0); //Pad 0 to the end
                            break;
                        }
                    case InstrBuilder.Opcodes.RETURN_OP.code:
                    case InstrBuilder.Opcodes.RESULT_OP.code:
                        {
                            code = code.concat(instr);
                            break;
                        }
                    case InstrBuilder.Opcodes.IF_EQ_OP.code:
                    case InstrBuilder.Opcodes.IF_NEQ_OP.code:
                    case InstrBuilder.Opcodes.IF_GT_OP.code:
                    case InstrBuilder.Opcodes.IF_LT_OP.code:
                        {
                            var opcode = instr[0];
                            var reg1=instr[1];
                            var reg2=instr[2];
                            var localLabel = instr[3];
                            if (symbolTable.localLabelExist(name, localLabel.name)) {
                                //The index of local label into the routine
                                var index = symbolTable.getLocalLabel(name, localLabel.name);
                                code = code.concat([opcode,reg1,reg2, index]);
                            } else {
                                var error = {
                                    str: "Local label does not exist",
                                    hash: localLabel.info,
                                    type: Exception.UNKNOWN_LOCAL_LABEL
                                };
                                throw error;
                            }
                            break;
                        }
                    default:
                        {
                            throw {
                                str: "Unknown Opcode",
                                type: Exception.UNKNOWN_OPCODE
                            };
                        }
                }

            });
        });
        //console.error(code)
        return code;
    }

    function fillChar(arr, int1, offset) {
        arr[offset] = int1.charCodeAt(0)
    }

    function fillInt2(arr, int4, offset) {
        arr[offset] = (int4 >> 8) & 0xff;
        arr[offset + 1] = (int4) & 0xff
    }

    function fillInt4(arr, int4, offset) {
        arr[offset] = (int4 >> 24) & 0xff;
        arr[offset + 1] = (int4 >> 16) & 0xff;
        arr[offset + 2] = (int4 >> 8) & 0xff;
        arr[offset + 3] = (int4) & 0xff
    }

    function fillString(arr, str, offset, length) {
        //Fill array with bytes in the string
        for (var i = 0; i < length; i++) {
            var charCode = str.charCodeAt(i);
            arr[offset + i] = charCode & 0xff;
        }
    }

    function fillArray(arr, srcArr, offset, length) {
        //Fill array with bytes in the string
        for (var i = 0; i < length; i++) {
            arr[offset + i] = srcArr[i];
        }
    }
    //Build the final executable
    function buildExecutable(routines) {
        var magic = "Waves"; //The magic number
        var dataBytesCount = 0; //Constants count
        var data = []; //Will contain the byte data in the symbol table
        var allData = symbolTable.getAllData(); //Get the map of all data in symbol table
        var dataNamesOffset = symbolTable.getTotalDataSize(); //Get the total size of constants in symbol table
        var mainIndex = symbolTable.getRoutineIndex('main') //Get the byte index of the main routine
        //console.warn(mainIndex)
        var routineSize = routines.length; //Size in byte of all the routines
        var finalExecutable = []; //Bytes of the final excutable code
        for (var key in allData) {
            //var constant_index=constant_count-1'
            var val = allData[key];
            if (val.dataType == SymbolTable.DATA_TYPE_CHAR) {
                //data[val.index]=val.value
                //constant_info[constant_count-1]=val.name;
                //.charCodeAt(0)
                fillChar(data, val.value, val.index);
                dataBytesCount += 1;
            } else if (val.dataType == SymbolTable.DATA_TYPE_INT) {
                fillInt4(data, val.value, val.index);
                dataBytesCount += 4;
            } else if (val.dataType == SymbolTable.DATA_TYPE_STRING) {
                fillString(data, val.value, val.index, val.size);
                dataBytesCount += val.size;
            } else throw new Error("Wring data type");

        }
        fillString(finalExecutable, magic, 0, 5); //Fill the executable with the magic number
        fillInt2(finalExecutable, dataBytesCount, finalExecutable.length) //Fill it with number of constants
        fillArray(finalExecutable, data, finalExecutable.length, dataBytesCount); //Fill it with the constants
        fillInt2(finalExecutable, mainIndex, finalExecutable.length) //Fill with byte index of the main routine
        fillInt2(finalExecutable, routineSize, finalExecutable.length) //Fill with total length of the routines
        fillArray(finalExecutable, routines, finalExecutable.length, routineSize); //Fill it with the routine codes
        return finalExecutable;
    }

    function build() {
        //Check if main routine exists
        if (!symbolTable.exists('main', SymbolTable.TYPE_ROUTINE)) {
            var error = {
                str: "main function doesn't exist",
                hash: { routine: 'main' },
                type: Exception.UNKNOWN_ROUTINE
            };
            throw error;
        };
        var code = buildRoutine();
        var exe = buildExecutable(code);
        return new Uint8Array(exe);
    }

    function constructor() {
        var Parser = parser.Parser;
        instrBuilder = new InstrBuilder();
        symbolTable = new SymbolTable();
        this.fileSystem = new FileSystem();
        Parser.prototype.parseError = function(str, hash) {
            throw {
                str: str,
                hash: hash,
                type: Exception.PARSE_ERROR
            };
        };
        this.parser = parser;
    }

    function compile_file(fname) {
        var that = this;
        var promise = new Promise(function(resolve, reject) {
            //Open the file
            //@param source The source file raed from file system
            that.fileSystem.read(fname).then(function(source) {
                //resolve(content);
                that.compile(source).then(function(res) {
                    //Compilation success
                    resolve(res);
                }, function(e) {
                    //On compile error
                    reject(e);
                });
            }, function(e) {
                //File reading error
                var error = {
                    str: e,
                    hash: { file: fname },
                    type: Exception.FILE_ERROR
                };
                reject(error);
            }.bind(this))
            .catch(function(e) {
                    //On compile error
                    reject(e);
                });;
        }.bind(this));
        return promise;
    }
    return {
        constructor: constructor,
        //Used to set File system
        setFileSystem: function(FS) {
            this.fileSystem = FS;
            fileSystem = FS;
        },
        handleIncludes: handleIncludes,
        build: build,
        compile_file: compile_file,
        compile: function(source) {
            function promiseEach(promises, fn) {
                var p = promises.reduce(function(initialvalue, currentValue, index, arr) {
                    return initialvalue.then(function() {
                        return fn(currentValue);
                    });
                }, Promise.resolve());
                return p;
            }
            var promises = [];
            var input = this.parser.parse(source);
            var done_including = false;
            for (var index = 0; index < input.length; index++) {
                //console.log(input[index]);
                switch (input[index].type) {

                    case 'data_block':
                        {
                            var p = assembleData(input[index].value);
                            promises.push(p);
                            break;
                        }
                    case 'include_list':
                        {
                            var p = this.handleIncludes(input[index].value);
                            promises.push(p);

                            break;
                        }
                    case 'routine_list':
                        {
                            var p = compile_routine(input[index].value);
                            promises.push(p);

                            break;
                        }
                };
            }
            //All the promises
            //To make sure they run one after another
            var promise = promiseEach(promises, function(item) {
                return item;
            });
            /*.then(function(){

                        },function(){

                        })*/
            ;

            return promise;
        },
        assemble: function(source) {
            var extension=[
                    '\nprintInt:',
                    'system 0x0 r0',
                    "cls:",
                    'system 0x2',
                    'newline:',
                    "get r0 newLine",
                    'load [r0] r0',
                    "call printChar r0",
                    'printChar:',
                    'system 0x1 r0',
                    'printStr:',
                    'iconst r3 0',
                    'iconst r1 1',
                     '.loop:',
                    'load [r0] r2',
                    'if-eq r2 r3 .stop',
                    'call printChar r2',
                    'add r0 r1 r0',
                    'if-neq r2 r3 .loop',
                    '.stop:',
                    "input:",
                    "system 0x4",
                    "result r0",
                    "return r0",
                    "alloc:",
                    "system 0x3 r0",
                    "result r1",
                    "return r1"
                ].join('\n');
             
                         var self = this;
            var promise = new Promise(function(resolve, reject) {
                try {

                    symbolTable.clear();
                    symbolTable.setData('newLine', SymbolTable.DATA_TYPE_CHAR, "\n");
                    symbolTable.setData('true', SymbolTable.DATA_TYPE_INT, 1);
                    symbolTable.setData('false', SymbolTable.DATA_TYPE_INT, 0);
                    //Start compiling from top level top
                    var c = this.compile(source+extension)
                    c.then(function(res) {
                        resolve(self.build());
                    }, function(e) {
                        reject(e);
                    }).catch(function(e) {
                        reject(e);
                    });
                    //resolve(result);
                } catch (e) {
                    reject(e);
                }
            }.bind(this));
            return promise;

        }
    };
};
"use strict";
var WavesExeReader = Class({
    setBuffer: function(buffer) {
        this._view = new DataView(buffer); //The arra
        this._strView = new StringView(buffer);
    },
    read: function() {
        var margic = this._strView.subview(0, 5).toString(); //5 bytes
        var constant_lenght = this._view.getUint16(5); //2 byte
        var constants = new Uint8Array(this._view.buffer, 7, constant_lenght); //Read the constant data
        var mainRoutineIndex = this._view.getUint16(5 + 2 + constant_lenght);
        var routines_length = this._view.getUint16(5 + 2 + constant_lenght + 2);
        var routines = new DataView(this._view.buffer, 5 + 2 + constant_lenght + 2 + 2, routines_length); //Read the routines
        return {
            margic: margic,
            constant_lenght: constant_lenght,
            constants: constants,
            mainRoutineIndex: mainRoutineIndex,
            routines_length: routines_length,
            routines: routines
        };
    }
});
Function.prototype.debounce = function (threshold, execAsap) {
 
    var func = this, timeout;
 
    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null; 
        };
 
        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);
 
        timeout = setTimeout(delayed, threshold || 100); 
    };
 
}
// Array.map polyfill
/*
if (Array.prototype.map === undefined) {
  Array.prototype.map = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      rv.push(fn(this[i]));

    return rv;
  };
}
if (Uint8Array.prototype.map === undefined) {
    Uint8Array.prototype.map = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      rv.push(fn(this[i]));

    return rv;
  };
}


// Array.filter polyfill
if (Array.prototype.filter === undefined) {
  Array.prototype.filter = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      if (fn(this[i])) rv.push(this[i]);

    return rv;
  };
}
*/
var OP={
	add:0,
	sub:1,
	mul:2,
	div:3,
	iconst:4,
	system:5,
	goto:6,
	call:7,
    get:8,
    load:9,
    store:10,
    move:11,
    return:12,
    result:13,
    if_eq:14,
    if_neq:15,
    if_gt:16,
    if_lt:17
};
var Memory=Class({
	constructor:function(){
		this.memory=new Uint8Array(0xffff);
        this.heap_start=-1;
        this.heap_stop=-1;
	},
    readReg:function(address){
        var absoluteAddress=this.fp+address;
        if (absoluteAddress < 0 || absoluteAddress >= this.max_stack) {
            throw "Register access violation at " + absoluteAddress;
        }
        return this.registers[absoluteAddress];
    },
    saveReg:function(address, value){
        var absoluteAddress=this.fp+address;
        if (absoluteAddress < 0 || absoluteAddress >= this.max_stack) {
            throw "Register access violation at " + absoluteAddress;
        }
        this.registers[absoluteAddress]=value;
    },
	load:function(address){
    	if (address < 0 ||address>this.heap_stop || address >= this.memory.byteLength) {
            throw "Memory access violation at " + address;
        }
        return this.memory[address];
    },
	store:function(address,byte){
    	if (address < 0 || address<this.heap_start||address>this.heap_stop|| address >= this.memory.byteLength) {
            throw "Memory access violation at " + address;
        }
       this.memory[address]=byte;
    },
    storeInt:function(address,value){
        this.store(address,(value>>24)&0xff);
        this.store(address+1,(value>>16)&0xff);
        this.store(address+2,(value>>8)&0xff);
        this.store(address+3,(value)&0xff);
    },
    loadInt:function(address){
        return this.load(address)<<24|this.load(address+1)<<16|this.load(address+2)<<8|this.load(address+3);
    },
    allocate_memory:function(size){
        if(size+this.heap_stop>= this.memory.byteLength){
            throw "Memory full";
        }
        var current_heap=this.heap_stop;
        if(size>0)
            current_heap+=1;
        this.heap_stop+=size;
        //Zero pad the memory
        for (var i=current_heap; i<current_heap+size; i++) {
            this.store(i,0);
        }
        return current_heap;
    },
    storeString:function(str,pointer,length){
        var writeSize=str.length;
        if(writeSize>=length)
            writeSize=length-1;//Save a byte for null
        for (var i = pointer;i<pointer+writeSize;i++) {
            var byte=str.charCodeAt(i-pointer);
            this.store(i,byte);//);
        }
        this.store(pointer+writeSize,"\0");//Store the null byte
        return pointer;
    }
});
"use strict";
var CPU = Class(Memory, function() {
    var requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 0);
            };
    })().bind(window);

    function nextOpcode() {
        var op = this.code.getUint16(this.pc, false);
        this.pc += 2;
        return op;
    }

    function readInt() {

    }

    function runCycle() {
        var self = this;
        var code = this.nextOpcode();
        //console.error(code >> 8);
        switch (code >> 8) { //Opcode
            case OP.add:
                {
                    //First byte for first register
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    //Second byte for second register
                    var reg2 = code >> 8;
                    //Third byte for third register
                    var reg3 = code & 0xff;
                    //Third reg=first reg value + second reg value 
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] + this.registers[reg2 + this.fp];
                    break;
                }
            case OP.sub:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var reg3 = code & 0xff;
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] - this.registers[reg2 + this.fp];
                    break;
                }
            case OP.mul:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var reg3 = code & 0xff;
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] * this.registers[reg2 + this.fp];
                    break;
                }
            case OP.div:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var reg3 = code & 0xff;
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] / this.registers[reg2 + this.fp];
                    break;
                }
            case OP.iconst:
                {
                    var reg = code & 0xff;
                    code = this.nextOpcode();
                    this.registers[reg + this.fp] = this.loadInt(code);
                    break;
                }
            case OP.goto:
                {
                    var newIP = code & 0xff;
                    this.pc = newIP;
                    break;
                }
            case OP.if_eq:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] == this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.if_neq:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] != this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.if_lt:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] < this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.if_gt:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] > this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.call:
                {
                    var a = code & 0xff;
                    code = this.nextOpcode();
                    var addr = (a << 8) | (code >> 8); //The address of the routine
                    //console.log("call",addr)
                    var b = code & 0xff;
                    code = this.nextOpcode();
                    var regRange = (b << 8) | (code >> 8); //The register range
                    //Get the args to the function
                    var args = [];
                    if (!(regRange == 0xffff)) {
                        var regStart = regRange >> 8;
                        var regEnd = regRange & 0xff;
                        var index = regStart;
                        do {
                            args.push(this.registers[index + this.fp]);
                            index++;
                        } while (index <= regEnd);
                    }
                    this.resultValue = 0;
                    this.registers[this.fp + 0xff] = this.pc; //Save the address of last call to register
                    this.fp += (0xff + 1); //Increment fp by number of save register+Beginning register of next function
                    this.pc = addr;
                    //Save 254 registers
                    args.forEach(function(elem, index, obj) {
                        self.registers[index + self.fp] = elem; //Save the arguments into the registers
                    });
                    break;
                }
            case OP.system:
                {
                    var systemRoutineCode = code & 0xff;
                    code = this.nextOpcode();
                    var args = [];
                    if (!(code == 0xffff)) {
                        var regStart = code >> 8;
                        var regEnd = code & 0xff;
                        var index = regStart;
                        do {
                            args.push(this.readReg(index));
                            index++;
                        } while (index <= regEnd);
                    }
                    this.callSystemRoutine(systemRoutineCode, args);
                    //this.events.emit('console.log', [args.toString()])
                    //this.events.emit('console.log',[args])
                    break;
                }
            case OP.get:
                {
                    var reg = code & 0xff;
                    code = this.nextOpcode();
                    this.registers[reg + this.fp] = code;
                    break;
                }
            case OP.load:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var addr = this.readReg(reg1); //get the adress of memory location stored in register
                    this.saveReg(reg2, this.load(addr)); //read the value at the address and store it in register
                    break;
                }
            case OP.store:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var val = this.readReg(reg1); //reg value
                    var addr = this.readReg(reg2); //address to store to
                    this.store(addr, val);
                    break;
                }
            case OP.move:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var val = this.readReg(reg1); //reg value
                    this.saveReg(reg2, val);
                    break;
                }
            case OP.return:
                {
                    var reg1 = code & 0xff;
                    this.resultValue = (reg1 == 0xff) ? 0 : this.readReg(reg1); //If reg1 ==no register i.e 0xff, function result=0, else normal thing
                    if (this.fp == 0) { //If there is no other function on stack frame
                        this.stop();
                    } else {

                        var return_address = this.registers[this.fp - 1];
                        this.fp = (this.fp - 0xff) - 1;
                        this.pc = return_address;
                    }

                    break;
                }
            case OP.result:
                {
                    var reg = code & 0xff;
                    this.registers[reg + this.fp] = this.resultValue;
                    break;
                }
            default:
                {
                    this.stop();
                    var currentPc = this.pc + 2;
                    this.events.emit("console.log", ["Unknown Opcode: " + (code >> 8) + " at pc: " + currentPc]);
                    throw new Error("Unknown Instruction:" + (code >> 8) + " at pc: " + currentPc);
                }
        }
    }
    return {
        runCycle: runCycle,
        requestAnimFrame: requestAnimFrame,
        nextOpcode: nextOpcode,
        readInt: readInt
    };
});
var VM = Class(CPU, function() {
    function constructor(max_stack) {
        this.execReader = new WavesExeReader();
        this.constantTable = null;
        this.registers = null;
        this.pc = 0;
        this.max_pc = 0;
        //this.max_stack = max_stack || 0xffff;
        this.max_stack = 1000;
        this.fp = 0; //Stack frame pointer
        this.pendingIO = false;
        this.resultValue = 0;
        Memory.call(this);
    }

    function setup(buffer) {
        var self = this;
        //Set the buffer to read from executable reader
        this.execReader.setBuffer(buffer);
        //Get the executable
        this.pendingIO = false;
        var exe = this.execReader.read();
        if (exe.margic != "Waves")
            throw {
                str: "Invalid Executable File",
                type: Exception.INVALID_EXE
            };
        this.fp = 0;
        this.constantTable = exe.constants; //Table of all constant declaration
        console.warn(exe.mainRoutineIndex)
        this.pc = exe.mainRoutineIndex; //The index in byte to the main function
        this.code = exe.routines; //The code to execute
        this.max_pc = (this.code.byteLength) - 1; //The maximum program counter possible
        this.registers = new Int32Array(this.max_stack); //Ths registers used
        for (var i = 0;i<this.constantTable.byteLength;i++) {
            var item=this.constantTable[i];
            self.memory[i] = item;
        }
       /*     console.log(this.constantTable.byteLength)
        this.constantTable.map(function(item, index, arr) {
            self.memory[index] = item;
        });*/
        this.heap_start = this.constantTable.length;
        this.heap_stop = this.heap_start;
        console.log("heap_start", this.heap_start);
        this.memory_offset = (this.constantTable.byteLength - 1);
        this.inputStreamLength = 100;
        this.inputStreamPointer = this.allocate_memory(this.inputStreamLength);
        //console.clear();
        console.log(new Uint8Array(this.code.buffer, this.code.byteOffset));
        //console.log(this.registers);
    }

    function run(buffer) {
        var self = this;
        this.events.emit('console.open', [function() {
            var runCycle = self.runCycle.bind(self);
            var timeout=8;
            self.setup(buffer);
            //console.log("pc: ",self.pc);
            self.interval = setInterval(function runable() {
                try {
                    if (self.pendingIO) {
                        clearInterval(self.interval);
                        self.interval=null;
                        self.events.bind('IOFinish',function(){
                            if(!self.interval)
                                self.interval = setInterval(runable,timeout);
                        });
                    } else if (self.pc <= self.max_pc)
                        runCycle();
                    else
                        self.stop();
                    //self.requestAnimFrame(runCycle);
                } catch (e) {
                    console.error(e);
                    self.events.emit('console.log',[e]);
                    self.stop();
                }
                //else
                //self.stop();
            }, timeout);



        }]);
        this.events.bind('console.close', function() {
            self.stop();
        });
        window.ev = this.events;

    }

    function stop() {
        console.error("stoppin app")
        clearInterval(this.interval);
    }

    function callSystemRoutine(id, args) {
        var self = this;
        switch (id) {
            case 0: //printInt(int val)
                {
                    this.events.emit('console.log', [args[0]]); //Print integer in reg
                    break
                }
            case 1: //printChar(char val)
                {
                    //console.log(args)
                    this.events.emit('console.log', [String.fromCharCode(args[0])]); //Print the charcter in the register
                    break
                }
            case 2: //cls(void) clear the screen
                {
                    //console.log(args)
                    this.events.emit('console.clear', []); //Print the charcter in the register
                    break
                }
            case 3: //int alloc(int size)allocate a memory of length size and return the address
                {
                    this.resultValue = this.allocate_memory(args[0]);
                    break
                }
            case 4: //int input(int pointer,int size) get some data from input stream
                {
                    this.pendingIO = true;
                    this.events.emit('console.input');
                    this.events.bind('console.inputFinish', function(text) {
                        self.resultValue = self.storeString(text, self.inputStreamPointer, self.inputStreamLength);
                        self.pendingIO = false;
                        self.events.emit('IOFinish');
                        //console.log(text)
                    });
                    //this.resultValue=this.allocate_memory(args[0]);
                    break
                }
            default:
                {
                    var errMessage = "Invalid System Call Number: " + id;
                    this.events.emit('console.log', [errMessage]);
                    throw new Error(errMessage);

                }
        }
    }

    function setEvents(events) {
        this.events = events;
    }
    return {
        constructor: constructor,
        setup: setup,
        run: run,
        setEvents: setEvents,
        callSystemRoutine:callSystemRoutine,
        stop: stop
    };
});
var Console=Class({
	constructor:function(){
		var self=this;
		window.C=this;
		this.$backdrop=$('.backdrop');
		this.$content=$('#console .window-content');
		//console.log(this.$backdrop.show())
		this.events.bind('console.open',this.open.bind(this));
		this.events.bind('console.show',this.show.bind(this));
		this.events.bind('console.log',this.log.bind(this));
		this.events.bind('console.hide',this.hide.bind(this));
		this.events.bind('console.clear',this.clear.bind(this));
		this.events.bind('console.close',this.close.bind(this));
		this.events.bind('console.input',this.input.bind(this));
		this.inputStream="";
		this.oldInputContent="";
		$('#console .btn-close').click(function(){
			self.events.emit('console.close');
		});
		//this.$content.click(function(){
			//self.make_editable(true);
			//this.focus();
			//this.blur();
			//self.$content.trigger('blur');
			//self.$content.attr('contenteditable',"true");
			//elf.events.emit('console.input');
		//})
		this.$content.on("keypress keyup keydown paste cut",function(e){
			self.handle_change(e);
			//e.preventDefault();
			//console.log(e)
		})
		.blur(function(){
			self.make_editable(false);
		})
		;
		//this.events.bind('console.inputFinish',function(text){
		//	console.log("input is:",'"'+text+'"')
		//});
	},
	handle_change:function(e){
		var self=this;
		var key_backspace=8;
		var key_enter=13;
		var key_delete=46;
		var inputStream=this.$content.text();
		var changedContent=inputStream.substr(this.oldInputContent.length);
		if (e.keyCode==key_backspace||e.type=="cut"||e.type=="paste") {
			if (changedContent.length==0) {
				e.preventDefault();
			}
			//console.log(this.inputStream,this.oldInputContent)
		}
		else if(e.keyCode==key_enter){
			//e.preventDefault();
			//this.log("\n");//Add a newline manually
			//this.make_editable(false);
			e.preventDefault();
			this.events.emit('console.inputFinish',[changedContent]);
			self.make_editable(false);
			self.log("\n");
			//(function(){
				//self.setCursorToEnd(self.$content.get(0));
				
				//self.setText(self.getText()+"\n");
				//self.log(" ");
				
				//elf.$content.trigger('blur');
			//}.debounce(20))();
		}
	}
	,
	setCursorToEnd:function(el){
		if (el.innerText.length>0) {
		var range=document.createRange();
		var sel=window.getSelection();
		range.setStart(el,1);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		el.focus();
	}
		//this.$content.
	}
	,
	make_editable:function(state){
		this.$content.attr('contenteditable',state);
		//this.setCursorToEnd(this.$content.get(0));
	},
	setText:function(text){
		this.$content.text(text);
	},
	getText:function(){
		return this.$content.text();
	}
	,
	log:function(text){

		/*var oldText=this.$content.text();
		if(oldText!="")
			oldText+="\n";
		this.$content.text(oldText+text);*/
		//console.error(text)
		//var oldText=this.$content.text();
		//this.$content.text(oldText+text);
		//console.log("logging: ",'"'+text+'"')
		this.setText(this.getText()+text);
	},
	input:function(){
		var self=this;
			self.make_editable(true);
		self.$content.trigger('focus');
		//self.log("\r");
		//self.log("");
		self.setCursorToEnd(self.$content.get(0));
		self.oldInputContent=self.$content.text();
		
		
	},
	clear:function(){
		this.$content.empty();
	},
	open:function(cb){
		this.show(cb);
	},
	show:function(cb){
		this.$backdrop.show(cb);
	},
	hide:function(cb){
		this.$backdrop.hide(cb);
	},
	close:function(cb){
		this.hide(cb);
		this.clear();
	}
});
var OperatingSystem=Class(Console,{
	constructor:function(){
		this.events=new Events;
		Console.call(this);	
	}
});
/**
 * @author Israel
 */
"use strict";
var Events = Class(function() {
	function copy(a){
		var obj=[];
		for(var i in a){
			obj[i]=a[i];
		}
		return obj;
	}

	return {
		constructor : function(obj) {
			 
			this.events = {};
			for (var i in obj)
			this.bind(i, obj[i]);
		},
		bind : function(event, fn) {
			this.register(event, fn);
		},
		register:function register(name, fn) {
			if (this.events[name]) {
				this.events[name].push(fn);
			
			} else {
				this.events[name] = [fn];
			}
		},
		unbind : function(event) {
			
			return false;
		},
		emit : function(name,args) {
			//args=args||[];
			var current_event = copy(this.events[name])||[];
			
			var fn;
			while ( fn = current_event.shift()) {
				fn.apply(null,args);
			}
		}
	};
});
"use strict";
var BaseEditor = Class({
    constructor: function() {
        //this.init();
        this._events = new Events();
        //this._events.trigger('compileError',{str:"hello world"});
        //this._events.bind('compileError',this.compileError);

    },
    compileError: function(error) {
        console.error(error)
        this.log("Error", error);
    },
    compileSuccess: function(res) {
        this.log("Success", {
            str:"Compilation Successful"
        });
    },
    log: function(type, obj) {
        console.log(obj.str);
    },
    clearLog: function() {
        console.log('clearing log')
    },
    setFileSystem:function(fs){
       this.fs=fs;
    },
    onCompile: function(fn) {},
    onRun: function(fn) {},
    onLoad: function(fn) {
        //document.getElementById('editor').style.fontSize='12px';
        this._events.bind('load', fn);
    }
});
/*
toggleMetroCharm(el[, position]);
showMetroCharm(el[, position]);
hideMetroCharm(el);
*/
var WavesEditor = Class(BaseEditor, {
    constructor: function() {
        var self=this;
        this._events = new Events();
        this.loader=$('#loader_backdrop');
        this.$compileBtn = $('#compileBtn');
        this.$runBtn = $('#runBtn');
        this.$aboutBtn = $('#aboutBtn');
        
        this.$saveBtn = $('#saveBtn');
        this.$closeBtn = $('#closeBtn');

        this.$fontSelect=$('#fontSelect');
        this._editor = ace.edit("editor");
        window.edit=this._editor;
        this._editor.setTheme("ace/theme/monokai");
        this.$logger=$("#logger");
        /*this._events.bind('load', function(){
            showMetroCharm(self.$logger);
        });*/
        
        //this._editor.getSession().on('change', function(e) {
        //alert(e)
        // e.type, etc

        //});
        this._editor.getSession().setMode("ace/mode/waves");
        var self=this;
        setTimeout(function(){
           var file=store.get('file.asm')||'.data\n    .string text "Hello World"\n .end\n main:\n     get r0 text\n     call printStr r0\n';
           self._editor.session.setValue(file);
            self._events.emit('load');
        });
        $('#loadExamples').find('a').click(function(e){
           self.loader.show();
           e.preventDefault();
           var filename=$(this).data('name');
           self.fs.read("examples/"+filename).then(function(content){
               //Success
               self._editor.session.setValue(content);
               self.loader.hide();
           },function(err){
               //Error
               self.loader.hide();
               console.error(err);
           });
        });
        this.$fontSelect.on('change',function(){
            var $this=$(this);
           $('#appbar a,#appbar select,#editor').css('font-size',$this.val());
            //document.getElementById('').style.fontSize=
        });
        $('.themes-select').children().click(function(e){
            e.preventDefault();
            var theme=$(this).find('a').data('theme');
            self._editor.setTheme(theme);
        });
        this.$aboutBtn.on('click',function(e){
           e.preventDefault();
           metroDialog.open('#about');
        });

        this.$saveBtn.on('click',function(e){
           e.preventDefault();
           var val=self._editor.session.getValue();
           store.set('file.asm',val);
           $.Notify({
                caption: 'Status',
                content: 'File Successfully saved',
                 type: 'success'
           });
        });
        this.$closeBtn.on('click',function(e){
           e.preventDefault();
           self._editor.session.setValue("")
        });
        //s.selection.addRange(new Range(1, 1, 30, 5))
        
    },
    getContent: function() {
        return this._editor.session.getValue();
    },
    alert: function(type, content) {
        var options = { 'background-color': "white" };
        if (type == "Warn")
            options = { 'background-color': "yellow" };
        else if (type == "Error")
            options = { 'background-color': "red" };
        $.Dialog({
            title: "Message",
            content: content,
            actions: [{
                title: "Ok",
                onclick: function(el) {
                    $(el).data('dialog').close();
                }
            }],
            options: options
        }).css(options);
    },
    compileError: function(error) {
        this.alert("Error", "Compilation Error<br /> See log for details");
        this.log("Error", error);
    },
    formatError:function(e){
        var str=e.str;
       if(e.type==Exception.DUPLICATE_DATA)
           console.error(e.info)
        while(str.search('\n')!=-1){
            str=str.replace('\n',"<br>");
        }
        return str;
    }
    ,
    log: function(type, obj) {
        if(type=="Error"){
            this.$logger.css({
                "color":"red",
                "border-top-color":"red" 
            })
            .find('#logger_message')
            .html(this.formatError(obj));
        }
        else{
            this.$logger.css({
                "color":"blue",
                "border-top-color":"blue" 
            })
            .find('#logger_message')
            .html(this.formatError(obj));
        }
        showMetroCharm(this.$logger);
    },
    onCompile: function(fn) {
        this.$compileBtn.click(function() {
            this.clearLog();
            fn(this.getContent());
        }.bind(this));
    },
    onRun: function(fn) {
        var self = this;
        this.$runBtn.click(function() {
            this.clearLog();
            try {
                fn.debounce(50)();
            } catch (e) {
                console.error(e)
                self.log("Error", {str:e.message});
            }
        }.bind(this));
    }
});
/* store.js - Copyright (c) 2010-2017 Marcus Westin */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.store=e()}}(function(){var define,module,exports;return function e(t,r,n){function o(u,a){if(!r[u]){if(!t[u]){var s="function"==typeof require&&require;if(!a&&s)return s(u,!0);if(i)return i(u,!0);var c=new Error("Cannot find module '"+u+"'");throw c.code="MODULE_NOT_FOUND",c}var f=r[u]={exports:{}};t[u][0].call(f.exports,function(e){var r=t[u][1][e];return o(r?r:e)},f,f.exports,e,t,r,n)}return r[u].exports}for(var i="function"==typeof require&&require,u=0;u<n.length;u++)o(n[u]);return o}({1:[function(e,t,r){"use strict";var n=e("../src/store-engine"),o=e("../storages/all"),i=[e("../plugins/json2")];t.exports=n.createStore(o,i)},{"../plugins/json2":2,"../src/store-engine":4,"../storages/all":6}],2:[function(e,t,r){"use strict";function n(){return e("./lib/json2"),{}}t.exports=n},{"./lib/json2":3}],3:[function(require,module,exports){"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};"object"!==("undefined"==typeof JSON?"undefined":_typeof(JSON))&&(JSON={}),function(){function f(e){return e<10?"0"+e:e}function this_value(){return this.valueOf()}function quote(e){return rx_escapable.lastIndex=0,rx_escapable.test(e)?'"'+e.replace(rx_escapable,function(e){var t=meta[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var r,n,o,i,u,a=gap,s=t[e];switch(s&&"object"===("undefined"==typeof s?"undefined":_typeof(s))&&"function"==typeof s.toJSON&&(s=s.toJSON(e)),"function"==typeof rep&&(s=rep.call(t,e,s)),"undefined"==typeof s?"undefined":_typeof(s)){case"string":return quote(s);case"number":return isFinite(s)?String(s):"null";case"boolean":case"null":return String(s);case"object":if(!s)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(s)){for(i=s.length,r=0;r<i;r+=1)u[r]=str(r,s)||"null";return o=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+a+"]":"["+u.join(",")+"]",gap=a,o}if(rep&&"object"===("undefined"==typeof rep?"undefined":_typeof(rep)))for(i=rep.length,r=0;r<i;r+=1)"string"==typeof rep[r]&&(n=rep[r],o=str(n,s),o&&u.push(quote(n)+(gap?": ":":")+o));else for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(o=str(n,s),o&&u.push(quote(n)+(gap?": ":":")+o));return o=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+a+"}":"{"+u.join(",")+"}",gap=a,o}}var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value);var gap,indent,meta,rep;"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(e,t,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;n<r;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=t,t&&"function"!=typeof t&&("object"!==("undefined"==typeof t?"undefined":_typeof(t))||"number"!=typeof t.length))throw new Error("JSON.stringify");return str("",{"":e})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(e,t){var r,n,o=e[t];if(o&&"object"===("undefined"==typeof o?"undefined":_typeof(o)))for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(n=walk(o,r),void 0!==n?o[r]=n:delete o[r]);return reviver.call(e,t,o)}var j;if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}()},{}],4:[function(e,t,r){"use strict";function n(e,t){var r={_seenPlugins:[],_namespacePrefix:"",_namespaceRegexp:null,_legalNamespace:/^[a-zA-Z0-9_\-]+$/,_storage:function(){if(!this.enabled)throw new Error("store.js: No supported storage has been added! Add one (e.g store.addStorage(require('store/storages/cookieStorage')) or use a build with more built-in storages (e.g https://github.com/marcuswestin/store.js/tree/master/dist/store.legacy.min.js)");return this._storage.resolved},_testStorage:function(e){try{var t="__storejs__test__";e.write(t,t);var r=e.read(t)===t;return e.remove(t),r}catch(n){return!1}},_assignPluginFnProp:function(e,t){var r=this[t];this[t]=function(){function t(){if(r){var e=r.apply(o,t.args);return delete t.args,e}}var n=Array.prototype.slice.call(arguments,0),o=this,i=[t].concat(n);return t.args=n,e.apply(o,i)}},_serialize:function(e){return JSON.stringify(e)},_deserialize:function(e,t){if(!e)return t;var r="";try{r=JSON.parse(e)}catch(n){r=e}return void 0!==r?r:t}},n=a(r,l);return u(e,function(e){n.addStorage(e)}),u(t,function(e){n.addPlugin(e)}),n}var o=e("./util"),i=o.pluck,u=o.each,a=o.create,s=o.isList,c=o.isFunction,f=o.isObject;t.exports={createStore:n};var l={version:"2.0.3",enabled:!1,storage:null,addStorage:function(e){this.enabled||this._testStorage(e)&&(this._storage.resolved=e,this.enabled=!0,this.storage=e.name)},addPlugin:function(e){var t=this;if(s(e))return void u(e,function(e){t.addPlugin(e)});var r=i(this._seenPlugins,function(t){return e===t});if(!r){if(this._seenPlugins.push(e),!c(e))throw new Error("Plugins must be function values that return objects");var n=e.call(this);if(!f(n))throw new Error("Plugins must return an object of function properties");u(n,function(r,n){if(!c(r))throw new Error("Bad plugin property: "+n+" from plugin "+e.name+". Plugins should only return functions.");t._assignPluginFnProp(r,n)})}},get:function(e,t){var r=this._storage().read(this._namespacePrefix+e);return this._deserialize(r,t)},set:function(e,t){return void 0===t?this.remove(e):(this._storage().write(this._namespacePrefix+e,this._serialize(t)),t)},remove:function(e){this._storage().remove(this._namespacePrefix+e)},each:function(e){var t=this;this._storage().each(function(r,n){e(t._deserialize(r),n.replace(t._namespaceRegexp,""))})},clearAll:function(){this._storage().clearAll()},hasNamespace:function(e){return this._namespacePrefix=="__storejs_"+e+"_"},namespace:function(e){if(!this._legalNamespace.test(e))throw new Error("store.js namespaces can only have alhpanumerics + underscores and dashes");var t="__storejs_"+e+"_";return a(this,{_namespacePrefix:t,_namespaceRegexp:t?new RegExp("^"+t):null})},createStore:function(e,t){return n(e,t)}}},{"./util":5}],5:[function(e,t,r){(function(e){"use strict";function r(){return Object.assign?Object.assign:function(e,t,r,n){for(var o=1;o<arguments.length;o++)a(Object(arguments[o]),function(t,r){e[r]=t});return e}}function n(){if(Object.create)return function(e,t,r,n){var o=u(arguments,1);return g.apply(this,[Object.create(e)].concat(o))};var e=function(){};return function(t,r,n,o){var i=u(arguments,1);return e.prototype=t,g.apply(this,[new e].concat(i))}}function o(){return String.prototype.trim?function(e){return String.prototype.trim.call(e)}:function(e){return e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}}function i(e,t){return function(){return t.apply(e,Array.prototype.slice.call(arguments,0))}}function u(e,t){return Array.prototype.slice.call(e,t||0)}function a(e,t){c(e,function(e,r){return t(e,r),!1})}function s(e,t){var r=f(e)?[]:{};return c(e,function(e,n){return r[n]=t(e,n),!1}),r}function c(e,t){if(f(e)){for(var r=0;r<e.length;r++)if(t(e[r],r))return e[r]}else for(var n in e)if(e.hasOwnProperty(n)&&t(e[n],n))return e[n]}function f(e){return null!=e&&"function"!=typeof e&&"number"==typeof e.length}function l(e){return e&&"[object Function]"==={}.toString.call(e)}function p(e){return e&&"[object Object]"==={}.toString.call(e)}var g=r(),d=n(),v=o(),h="undefined"!=typeof window?window:e;t.exports={assign:g,create:d,trim:v,bind:i,slice:u,each:a,map:s,pluck:c,isList:f,isFunction:l,isObject:p,Global:h}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],6:[function(e,t,r){"use strict";t.exports={localStorage:e("./localStorage"),"oldFF-globalStorage":e("./oldFF-globalStorage"),"oldIE-userDataStorage":e("./oldIE-userDataStorage"),cookieStorage:e("./cookieStorage"),sessionStorage:e("./sessionStorage"),memoryStorage:e("./memoryStorage")}},{"./cookieStorage":7,"./localStorage":8,"./memoryStorage":9,"./oldFF-globalStorage":10,"./oldIE-userDataStorage":11,"./sessionStorage":12}],7:[function(e,t,r){"use strict";function n(e){if(!e||!s(e))return null;var t="(?:^|.*;\\s*)"+escape(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";return unescape(p.cookie.replace(new RegExp(t),"$1"))}function o(e){for(var t=p.cookie.split(/; ?/g),r=t.length-1;r>=0;r--)if(l(t[r])){var n=t[r].split("="),o=unescape(n[0]),i=unescape(n[1]);e(i,o)}}function i(e,t){e&&(p.cookie=escape(e)+"="+escape(t)+"; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/")}function u(e){e&&s(e)&&(p.cookie=escape(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/")}function a(){o(function(e,t){u(t)})}function s(e){return new RegExp("(?:^|;\\s*)"+escape(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(p.cookie)}var c=e("../src/util"),f=c.Global,l=c.trim;t.exports={name:"cookieStorage",read:n,write:i,each:o,remove:u,clearAll:a};var p=f.document},{"../src/util":5}],8:[function(e,t,r){"use strict";function n(){return f.localStorage}function o(e){return n().getItem(e)}function i(e,t){return n().setItem(e,t)}function u(e){for(var t=n().length-1;t>=0;t--){var r=n().key(t);e(o(r),r)}}function a(e){return n().removeItem(e)}function s(){return n().clear()}var c=e("../src/util"),f=c.Global;t.exports={name:"localStorage",read:o,write:i,each:u,remove:a,clearAll:s}},{"../src/util":5}],9:[function(e,t,r){"use strict";function n(e){return s[e]}function o(e,t){s[e]=t}function i(e){for(var t in s)s.hasOwnProperty(t)&&e(s[t],t)}function u(e){delete s[e]}function a(e){s={}}t.exports={name:"memoryStorage",read:n,write:o,each:i,remove:u,clearAll:a};var s={}},{}],10:[function(e,t,r){"use strict";function n(e){return f[e]}function o(e,t){f[e]=t}function i(e){for(var t=f.length-1;t>=0;t--){var r=f.key(t);e(f[r],r)}}function u(e){return f.removeItem(e)}function a(){i(function(e,t){delete f[e]})}var s=e("../src/util"),c=s.Global;t.exports={name:"oldFF-globalStorage",read:n,write:o,each:i,remove:u,clearAll:a};var f=c.globalStorage},{"../src/util":5}],11:[function(e,t,r){"use strict";function n(e,t){if(!v){var r=s(e);d(function(e){e.setAttribute(r,t),e.save(p)})}}function o(e){if(!v){var t=s(e),r=null;return d(function(e){r=e.getAttribute(t)}),r}}function i(e){d(function(t){for(var r=t.XMLDocument.documentElement.attributes,n=r.length-1;n>=0;n--){var o=r[n];e(t.getAttribute(o.name),o.name)}})}function u(e){var t=s(e);d(function(e){e.removeAttribute(t),e.save(p)})}function a(){d(function(e){var t=e.XMLDocument.documentElement.attributes;e.load(p);for(var r=t.length-1;r>=0;r--)e.removeAttribute(t[r].name);e.save(p)})}function s(e){return e.replace(/^d/,"___$&").replace(h,"___")}function c(){if(!g||!g.documentElement||!g.documentElement.addBehavior)return null;var e,t,r,n="script";try{t=new ActiveXObject("htmlfile"),t.open(),t.write("<"+n+">document.w=window</"+n+'><iframe src="/favicon.ico"></iframe>'),t.close(),e=t.w.frames[0].document,r=e.createElement("div")}catch(o){r=g.createElement("div"),e=g.body}return function(t){var n=[].slice.call(arguments,0);n.unshift(r),e.appendChild(r),r.addBehavior("#default#userData"),r.load(p),t.apply(this,n),e.removeChild(r)}}var f=e("../src/util"),l=f.Global;t.exports={name:"oldIE-userDataStorage",write:n,read:o,each:i,remove:u,clearAll:a};var p="storejs",g=l.document,d=c(),v=(l.navigator?l.navigator.userAgent:"").match(/ (MSIE 8|MSIE 9|MSIE 10)\./),h=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g")},{"../src/util":5}],12:[function(e,t,r){"use strict";function n(){return f.sessionStorage}function o(e){return n().getItem(e)}function i(e,t){return n().setItem(e,t)}function u(e){for(var t=n().length-1;t>=0;t--){var r=n().key(t);e(o(r),r)}}function a(e){return n().removeItem(e)}function s(){return n().clear()}var c=e("../src/util"),f=c.Global;t.exports={name:"sessionStorage",read:o,write:i,each:u,remove:a,clearAll:s}},{"../src/util":5}]},{},[1])(1)});
/**
 * @author Israel
 */
/**
 * @author Israel
 */
"use strict";
//require('hello')
Class(function() {
    var assembler;
    var editor;
    var fileSystem;
    var virtualMachine;
    var operatingSystem;
    return {
        constructor: function(asm, ed, fs, vm) {
            assembler = asm;
            editor = ed;
            editor.setFileSystem(fs);
            assembler.setFileSystem(fs);
            virtualMachine = vm;
            operatingSystem = new OperatingSystem();
            vm.setEvents(operatingSystem.events);
            this.init();
        },
        init: function() {
            var self = this;
            editor.onLoad(function() {
                editor.loader.hide();
                //console.error("dd")
            });
            editor.onCompile(function(source) {
                assembler.assemble(source).then(function(res) {
                    //decompile(res);
                    self.compiledBuffer = res.buffer;
                    /*$.post(
                        "bin/saveBin.php", { code: new StringView(self.compiledBuffer).toString() }
                    );*/
                    editor.compileSuccess();
                }, function(res) {
                    editor.compileError(res);
                    self.compiledBuffer = null;
                });
            });
            editor.onRun(function() {
                if (self.compiledBuffer) {
                    virtualMachine.run(self.compiledBuffer);
                } else {
                    editor.alert("Warn", "Source file not compiled");
                }
            });
        },
        run: function() {},
        main: function(App) {
            $(document).ready(function(){
                var asm = new Assembler(parser);
                asm.constructor();
                var app = new App(asm, new WavesEditor, new FileSystem('http://localhost'), new VM);
                app.run();
            });
        }
    };
});