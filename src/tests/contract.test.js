const request = require('supertest');
const app = require('../app');
const {seed} = require("../../scripts/seedDb");

describe('Contracts', () => {
    describe('/contracts/:id', () => {
        beforeEach(async () => {
            await seed();
        })

        it('return 401 when profile_id does not exist', async () => {
            await request(app)
                .get('/contracts/1')
                .set('profile_id', '199')
                .expect(401);
        });

        it('return 404 when contract not found', async () => {
            await request(app)
                .get('/contracts/199')
                .set('profile_id', '5')
                .expect(404);
        });

        it('return 404 when profile_id mismatch with client or contractor', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/1')
                .set('profile_id', '7');
            expect(statusCode).toEqual(404);
        });

        it('return contract when profile_id  matches with client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/1')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body).toMatchObject({
                id: 1,
                terms: 'bla bla bla',
                status: 'terminated',
                ClientId: 1,
                ContractorId: 5,
            });
        });

        it('return contract when profile_id  matches with client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/1')
                .set('profile_id', '5');

            expect(statusCode).toEqual(200);
            expect(body).toMatchObject({
                id: 1,
                terms: 'bla bla bla',
                status: 'terminated',
                ClientId: 1,
                ContractorId: 5,
            });
        });

        it('return contract when profile_id matches with client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/7')
                .set('profile_id', '4');

            expect(statusCode).toEqual(200);
            expect(body.id).toEqual(7);
        });
    });

    describe('/contracts', () => {
        beforeEach(async () => {
            await seed();
        })

        it('return active contracts for the client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(1);
            expect(body[0].id).toEqual(2);
            expect(body[0].ClientId).toEqual(1);
            expect(body[0].ContractorId).toEqual(6);
            expect(body[0].terms).toEqual('bla bla bla');
            expect(body[0].status).toEqual('in_progress');
            expect(body[1]).toBeUndefined();
        });

        it('return active contracts for the client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts')
                .set('profile_id', '4');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(3);
            expect(body[0].id).toEqual(7);
            expect(body[0].status).toEqual('in_progress');
            expect(body[1].id).toEqual(8);
            expect(body[1].status).toEqual('in_progress');
            expect(body[2].id).toEqual(9);
            expect(body[2].status).toEqual('in_progress');
            expect(body[3]).toBeUndefined();
        });
    });
});
