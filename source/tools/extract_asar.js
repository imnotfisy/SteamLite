#!/usr/bin/env node
// Minimal standalone ASAR extractor (no external deps), based on the
// documented electron/asar pickle format.
const fs = require('fs');
const path = require('path');

function readPickleUInt32(buf) {
  // Pickle payload starts right after the 4-byte payloadSize header field.
  // For a pickle containing a single uint32, that value sits at offset 4.
  return buf.readUInt32LE(4);
}

function readPickleString(buf) {
  // payload starts at offset 4; first 4 bytes of payload = string length (int32LE)
  const len = buf.readInt32LE(4);
  const strStart = 8;
  return buf.slice(strStart, strStart + len).toString('utf8');
}

function extractAsar(archivePath, destDir) {
  const fd = fs.openSync(archivePath, 'r');
  const archiveSize = fs.fstatSync(fd).size;

  const sizeBuf = Buffer.alloc(8);
  fs.readSync(fd, sizeBuf, 0, 8, 0);
  const headerSize = readPickleUInt32(sizeBuf);

  const headerBuf = Buffer.alloc(headerSize);
  fs.readSync(fd, headerBuf, 0, headerSize, 8);
  const headerStr = readPickleString(headerBuf);
  const header = JSON.parse(headerStr);

  const baseOffset = 8 + headerSize;

  function walk(node, relPath) {
    if (node.files) {
      const dirPath = path.join(destDir, relPath);
      fs.mkdirSync(dirPath, { recursive: true });
      for (const [name, child] of Object.entries(node.files)) {
        walk(child, path.join(relPath, name));
      }
    } else if (node.link !== undefined) {
      // symlink entry - skip creation, just note it
      console.log('SYMLINK (skipped):', relPath, '->', node.link);
    } else {
      // file entry
      const outPath = path.join(destDir, relPath);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      if (node.size === 0) {
        fs.writeFileSync(outPath, Buffer.alloc(0));
        return;
      }
      if (node.unpacked) {
        console.log('UNPACKED (no data in archive):', relPath);
        return;
      }
      const offset = baseOffset + parseInt(node.offset, 10);
      const buf = Buffer.alloc(node.size);
      fs.readSync(fd, buf, 0, node.size, offset);
      fs.writeFileSync(outPath, buf);
    }
  }

  walk(header, '');
  fs.closeSync(fd);
  fs.writeFileSync(path.join(destDir, '__asar_header.json'), JSON.stringify(header, null, 2));
  console.log('Done. Archive size:', archiveSize, 'Header size:', headerSize);
}

const [archivePath, destDir] = process.argv.slice(2);
if (!archivePath || !destDir) {
  console.error('usage: node extract_asar.js <archive.asar> <destDir>');
  process.exit(1);
}
extractAsar(archivePath, destDir);
