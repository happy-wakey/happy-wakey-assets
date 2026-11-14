import assert from 'node:assert/strict';
import test from 'node:test';

import { validateAssets, validateAssetPath, validateSvgMarkup } from '../scripts/validate-assets.mjs';

test('brand assets have immutable integrity and safe portable metadata', async () => {
  const manifest = await validateAssets();
  assert.equal(manifest.assets.length, 4);
  assert.deepEqual(
    manifest.assets.map(({ role }) => role),
    [
      'application-icon-source',
      'application-mark',
      'application-mark-monochrome',
      'horizontal-wordmark',
    ],
  );
});

test('asset paths reject traversal and noncanonical segments', () => {
  for (const path of ['branding/../secrets', 'tokens/../../env', 'css//style.css', 'branding/./icon.png']) {
    assert.throws(() => validateAssetPath(path));
  }
  assert.equal(validateAssetPath('branding/icon.png'), 'branding/icon.png');
});

test('SVG metadata rejects active content and remote dependencies', () => {
  const safe = '<svg viewBox="0 0 20 20"><title id="title">Icon</title></svg>';
  assert.doesNotThrow(() => validateSvgMarkup(safe, 20, 20));
  for (const extra of [
    '<svg onload="alert(1)"></svg>',
    '<a href="javascript:alert(1)"></a>',
    '<image href="https://example.com/remote.png"/>',
    '<foreignObject></foreignObject>',
  ]) {
    assert.throws(() => validateSvgMarkup(safe + extra, 20, 20));
  }
});
