// dashboard/tests/pact/fleetpulse.pact.test.js
// ALL interactions in ONE file - avoids pact file corruption

import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import axios from 'axios';
import { describe, it } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { eachLike, like, string, integer } = MatchersV3;

const provider = new PactV3({
  consumer: 'FleetPulse-Dashboard',
  provider: 'FleetPulse-API',
  dir: path.resolve(__dirname, '../../../pacts'),
  logLevel: 'warn',
});

describe('FleetPulse API Pact', () => {

  it('GET /api/drivers - returns all drivers', async () => {
    await provider
      .addInteraction({
        states: [{ description: 'drivers exist' }],
        uponReceiving: 'a request for all drivers',
        withRequest: {
          method: 'GET',
          path: '/api/drivers',
          headers: { Accept: 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: eachLike({
            id: integer(1),
            name: string('Marcus Chen'),
            email: string('marcus.chen@fleetpulse.dev'),
            phone: string('713-555-0101'),
            license_number: string('TX-DL-82910'),
            status: string('available'),
          })
        }
      })
      .executeTest(async (mockServer) => {
        const response = await axios.get(`${mockServer.url}/api/drivers`, {
          headers: { Accept: 'application/json' }
        });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0]).toHaveProperty('name');
        expect(response.data[0]).toHaveProperty('status');
      });
  });

  it('GET /api/vehicles - returns all vehicles', async () => {
    await provider
      .addInteraction({
        states: [{ description: 'vehicles exist' }],
        uponReceiving: 'a request for all vehicles',
        withRequest: {
          method: 'GET',
          path: '/api/vehicles',
          headers: { Accept: 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: eachLike({
            id: integer(1),
            vehicle_code: string('EV-1001'),
            make: string('Tesla'),
            model: string('Model 3'),
            year: integer(2024),
            status: string('available'),
            lat: string('29.7604000'),
            lng: string('-95.3698000'),
            current_battery_pct: integer(78),
          })
        }
      })
      .executeTest(async (mockServer) => {
        const response = await axios.get(`${mockServer.url}/api/vehicles`, {
          headers: { Accept: 'application/json' }
        });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0]).toHaveProperty('vehicle_code');
        expect(response.data[0]).toHaveProperty('lat');
        expect(response.data[0]).toHaveProperty('lng');
      });
  });

  it('POST /api/assignments - creates a new assignment', async () => {
    await provider
      .addInteraction({
        states: [{ description: 'vehicle 1 is available' }],
        uponReceiving: 'a request to create an assignment',
        withRequest: {
          method: 'POST',
          path: '/api/assignments',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: {
            vehicle_id: integer(1),
            driver_id: integer(2),
          }
        },
        willRespondWith: {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
          body: like({
            id: integer(1),
            vehicle_id: integer(1),
            driver_id: integer(2),
            status: string('pending'),
            message: string('EV-1001 assigned to Sarah Kim'),
          })
        }
      })
      .executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/assignments`,
          { vehicle_id: 1, driver_id: 2 },
          { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
        );
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data.status).toBe('pending');
        expect(response.data).toHaveProperty('message');
      });
  });

});