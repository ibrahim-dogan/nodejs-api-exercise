const request = require('supertest');
const app = require('../app');
const {seed} = require("../../scripts/seedDb");

describe('Admin Tests', () => {
    describe('/admin/best-profession', () => {
        beforeEach(async () => {
            await seed();
        })

        it('returns profession with the highest income in the time range', async () => {
            const {statusCode, body} = await request(app)
                .get('/admin/best-profession')
                .query({start: '1900-01-01T01:01:01.000Z'})
                .query({end: '2025-01-01T01:01:01.000Z'});

            expect(statusCode).toEqual(200);
            expect(body).toEqual(
                expect.objectContaining({
                    profession: 'Programmer',
                    totalEarned: 2683,
                })
            );
        });

        it('returns null, no jobs in the time range', async () => {
            const {statusCode, body} = await request(app)
                .get('/admin/best-profession')
                .query({start: '2024-01-01T01:01:01.000Z'})
                .query({end: '2025-01-01T01:01:01.000Z'});

            expect(statusCode).toEqual(200);
            expect(body).toBe(null);
        });
    });

    describe('/admin/best-clients', () => {

        /**
         * 7. ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` -
         *    returns the clients the paid the most for jobs in the query time period. limit query parameter
         *    should be applied, default limit is 2.
         */
        it('return all clients who paid most within in the time range', async () => {
            const {statusCode, body} = await request(app)
                .get('/admin/best-clients')
                .query({start: '2020-08-10T01:00:00.000Z'})
                .query({end: '2020-08-12T01:00:00.000Z'});

            expect(statusCode).toEqual(200);
            expect(body[0]).toEqual(
                expect.objectContaining({"fullName": "Harry Potter", "id": 1, "paid": 21})
            );
            expect(body[1]).toBeUndefined;
        });

        /**
         * Sorted and default (2) limited results
         */
        it('return ordered list, default 2 elements,  by total paid DESC', async () => {
            const {statusCode, body} = await request(app)
                .get('/admin/best-clients')
                .query({start: '1900-01-01T01:01:01.000Z'})
                .query({end: '2025-01-01T01:01:01.000Z'});

            expect(statusCode).toEqual(200);
            expect(body[0]).toEqual(
                expect.objectContaining({"fullName": "Ash Kethcum", "id": 4, "paid": 2020})
            );
            expect(body[1]).toEqual(
                expect.objectContaining({"fullName": "Mr Robot", "id": 2, "paid": 442})
            );
            expect(body[2]).toBeUndefined;
        });

        /**
         * Sorted and limited (1) results
         */
        it('limit the returned list by query param', async () => {
            const {statusCode, body} = await request(app)
                .get('/admin/best-clients')
                .query({start: '1900-01-01T01:01:01.000Z'})
                .query({end: '2025-01-01T01:01:01.000Z'})
                .query({limit: 1});

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(1)
            expect(body[0]).toEqual(
                expect.objectContaining({"fullName": "Ash Kethcum", "id": 4, "paid": 2020})
            );
            expect(body[1]).toBeUndefined;
        });

        /**
         * Return empty array as it is not possible to have jobs in the future
         */
        it('return [] with no jobs within given time range', async () => {
            const {statusCode, body} = await request(app)
                .get('/admin/best-clients')
                .query({start: '2024-01-01T01:01:01.000Z'})
                .query({end: '2025-01-01T01:01:01.000Z'});

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(0);
        });
    });
});
