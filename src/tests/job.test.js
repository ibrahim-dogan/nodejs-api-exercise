const request = require('supertest');
const app = require('../app');
const Profile = require('../model');
const {seed} = require("../../scripts/seedDb");

describe('Jobs', () => {
    describe('/jobs/unpaid', () => {
        beforeEach(async () => {
            await seed();
        })

        it('return unpaid jobs', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(1);
            expect(body[0].id).toEqual(2);
            expect(body[0].ContractId).toEqual(2);
            expect(body[0].description).toEqual('work');
            expect(body[0].price).toEqual(201);
            expect(body[0].paid).toEqual(null);
            expect(body[0].paymentDate).toEqual(null);
            expect(body[1]).toBeUndefined();
        });

        it('return unpaid jobs if in_progress', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '8');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(0);
        });

        it('return {}, profile_id does not exist', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '199');

            expect(statusCode).toEqual(401);
            expect(body).toEqual({
                "error": "Unauthorized User"
            });
        });
    });

    describe('/jobs/:id/pay', () => {
        beforeEach(async () => {
            await seed();
        })

        it('return 404 when job is not found', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/33/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(404);
        });

        it('return 400, client has insufficient funds', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/5/pay')
                .set('profile_id', '4');

            expect(statusCode).toEqual(400);
        });

        it('client pays contractor', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/2/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);

            // here we will go to DB and check that money was moved
            const contractor = await Profile.Profile.findByPk(6);
            const client = await Profile.Profile.findByPk(1);

            expect(client.balance).toEqual(1150-201);
            expect(contractor.balance).toEqual(1214+201);
        });

        it('mark job as paid', async () => {
            const {statusCode, body} = await request(app)
                .post('/jobs/2/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body.id).toEqual(2);
            expect(body.ContractId).toEqual(2);
            expect(body.Contract.ContractorId).toEqual(6);
            expect(body.description).toEqual('work');
            expect(body.price).toEqual(201);
            expect(body.paid).toEqual(true);
        });
    });
});
