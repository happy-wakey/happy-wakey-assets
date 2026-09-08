import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function hash(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function pngDimensions(buffer) {
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

export async function validateAssets() {
  const manifest = JSON.parse(
    await readFile(resolve(root, 'assets.manifest.json'), 'utf8'),
  );
  assert.equal(manifest.schemaVersion, 'happy-wakey.assets.v1');
  assert.equal(manifest.brand, 'Happy Wakey');
  assert.ok(Array.isArray(manifest.assets));
  assert.ok(manifest.assets.length >= 4);

  const seenPaths = new Set();
  const seenRoles = new Set();
  for (const asset of manifest.assets) {
    assert.match(asset.path, /^(?:branding|css|tokens)\/[a-z0-9./-]+$/);
    assert.equal(seenPaths.has(asset.path), false, `duplicate path ${asset.path}`);
    assert.equal(seenRoles.has(asset.role), false, `duplicate role ${asset.role}`);
    seenPaths.add(asset.path);
    seenRoles.add(asset.role);
    assert.ok(Number.isInteger(asset.width) && asset.width > 0);
    assert.ok(Number.isInteger(asset.height) && asset.height > 0);
    assert.match(asset.sha256, /^[0-9a-f]{64}$/);

    const contents = await readFile(resolve(root, asset.path));
    assert.equal(hash(contents), asset.sha256, `${asset.path} integrity drifted`);
    if (asset.mediaType === 'image/png') {
      assert.deepEqual(pngDimensions(contents), {
        width: asset.width,
        height: asset.height,
      });
      continue;
    }

    assert.equal(asset.mediaType, 'image/svg+xml');
    const svg = contents.toString('utf8');
    assert.match(svg, /<title id="title">[^<]+<\/title>/);
    assert.match(svg, new RegExp(`viewBox="0 0 ${asset.width} ${asset.height}"`));
    assert.doesNotMatch(svg, /<(?:script|foreignObject)\b/i);
    assert.doesNotMatch(svg, /(?:href|src)="(?:https?:|data:|\/\/)/i);
  }

  const tokens = JSON.parse(
    await readFile(resolve(root, 'tokens/happy-wakey.tokens.json'), 'utf8'),
  );
  const css = await readFile(resolve(root, 'css/happy-wakey.css'), 'utf8');
  assert.equal(tokens.schemaVersion, 'happy-wakey.design-tokens.v1');
  for (const [name, value] of Object.entries(tokens.color)) {
    const cssName = name
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/([a-z])([0-9])/g, '$1-$2');
    assert.match(css, new RegExp(`--hawky-${cssName}: ${value.toLowerCase()};`));
  }
  assert.match(css, /prefers-reduced-motion: reduce/);

  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await validateAssets();
  process.stdout.write('validated Happy Wakey asset integrity and design tokens\n');
}
