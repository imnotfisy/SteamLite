#!/usr/bin/env node
// Minimal standalone ASAR packer (no external deps), mirroring extract_asar.js.
// Rebuilds an .asar archive from a directory tree using the same pickle format.
const fs = require('fs');
const path = require('path');

function writePickleUInt32(value) {
  // A pickle holding a single uint32: [payloadSize(u32)][payload...]
  // payload = the u32 itself, so payloadSize = 4, then padded to 4-byte alignment (already aligned).
  const buf = Buffer.alloc(8);
  buf.writeUInt32LE(4, 0); // payloadSize
  buf.writeUInt32LE(value, 4);
  return buf;
}

function writePickleString(str) {
  const strBuf = Buffer.from(str, 'utf8');
  const len = strBuf.length;
  const aligned = len + ((4 - (len % 4)) % 4);
  const payloadSize = 4 + aligned; // int32 length + padded string bytes
  const buf = Buffer.alloc(4 + payloadSize);
  buf.writeUInt32LE(payloadSize, 0);
  buf.writeInt32LE(len, 4);
  strBuf.copy(buf, 8);
  // remaining padding bytes are already zero from Buffer.alloc
  return buf;
}

function packAsar(srcDir, destPath) {
  const fileBuffers = [];
  let cursor = 0;

  function walk(dirPath) {
    const names = fs.readdirSync(dirPath).sort();
    const filesObj = {};
    for (const name of names) {
      if (name === '__asar_header.json') continue; // artifact from our extractor, not real content
      const full = path.join(dirPath, name);
      const st = fs.lstatSync(full);
      if (st.isDirectory()) {
        filesObj[name] = { files: walk(full) };
      } else if (st.isSymbolicLink()) {
        const link = fs.readlinkSync(full);
        filesObj[name] = { link };
      } else {
        const buf = fs.readFileSync(full);
        const entry = { size: buf.length, offset: String(cursor) };
        if (st.mode & 0o111) entry.executable = true;
        filesObj[name] = entry;
        if (buf.length > 0) {
          fileBuffers.push(buf);
          cursor += buf.length;
        }
      }
    }
    return filesObj;
  }

  const header = { files: walk(srcDir) };
  const headerJsonStr = JSON.stringify(header);
  const headerPickle = writePickleString(headerJsonStr);
  const sizePickle = writePickleUInt32(headerPickle.length);

  const out = fs.createWriteStream(destPath);
  out.write(sizePickle);
  out.write(headerPickle);
  for (const buf of fileBuffers) out.write(buf);
  out.end();
  return new Promise((resolve, reject) => {
    out.on('finish', () => resolve({ headerSize: headerPickle.length, totalDataBytes: cursor }));
    out.on('error', reject);
  });
}

const [srcDir, destPath] = process.argv.slice(2);
if (!srcDir || !destPath) {
  console.error('usage: node pack_asar.js <srcDir> <dest.asar>');
  process.exit(1);
}
packAsar(srcDir, destPath).then((info) => {
  console.log('Packed asar:', destPath, info);
}).catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
