// api/tests/pact/provider.verify.test.js

const { Verifier } = require('@pact-foundation/pact');
const path = require('path');
const pool = require('../../db/connection');

describe('Pact Provider Verification', () => {

  it('validates contracts from FleetPulse-Dashboard', async () => {

    const opts = {
      provider: 'FleetPulse-API',
      providerBaseUrl: 'http://localhost:3001',

      pactUrls: [
        path.resolve(__dirname, '../../../pacts/FleetPulse-Dashboard-FleetPulse-API.json')
      ],

      stateHandlers: {
        'vehicles exist': async () => {
          console.log('✓ State: vehicles exist');
        },
        'drivers exist': async () => {
          console.log('✓ State: drivers exist');
        },
        'vehicle 1 is available': async () => {
          // Cancel any existing assignments so vehicle 1 is free
          await pool.query(
            `UPDATE assignments SET status = 'cancelled'
             WHERE vehicle_id = 1 AND status IN ('pending', 'active')`
          );
          console.log('✓ State: vehicle 1 cleared - ready to assign');
        },
      },

      logLevel: 'warn',
    };

    return new Verifier(opts).verifyProvider();

  }, 30000);

});