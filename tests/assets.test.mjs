import assert from 'node:assert/strict';
import test from 'node:test';

import { validateAssets } from '../scripts/validate-assets.mjs';

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
