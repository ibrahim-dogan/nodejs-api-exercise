const request = require('supertest');
const app = require('../app');
const {seed} = require("../../scripts/seedDb");

describe('Balances', () => {
    describe('/balances/deposit/:userId', () => {
        beforeEach(async () => {
            await seed();
        })

        it('no jobs, so error', async () => {
            const {statusCode, body} = await request(app)
                .post('/balances/deposit/7')
                .send({depositAmount: 50});
            expect(statusCode).toEqual(404);
            expect(body).toEqual(
                expect.objectContaining({})
            );
        });

        it('increase clients balance', async () => {
            const {statusCode, body} = await request(app)
                .post('/balances/deposit/2')
                .send({depositAmount: 50});

            expect(statusCode).toEqual(200);
            expect(body.id).toEqual(2);
            expect(body.balance).toEqual(281.11);
        });

        it('returns 400 if deposit exceeds the threshold of 0.25 of unpaid jobs sum', async () => {
            const {statusCode, body} = await request(app)
                .post('/balances/deposit/1')
                .send({depositAmount: 100});

            expect(statusCode).toEqual(400);
            expect(body.error).toEqual('depositAmount can not be greater more than 25% total of your unpaidJobs to pay');
        });

        it('returns 400 if depositAmount is non-positive', async () => {
            const {statusCode} = await request(app)
                .post('/balances/deposit/12')
                .send({depositAmount: 0});

            expect(statusCode).toEqual(400);
        });

        it('returns 404 if user is not a client', async () => {
            const {statusCode} = await request(app)
                .post('/balances/deposit/5')
                .send({depositAmount: 50});

            expect(statusCode).toEqual(404);
        });
    });
});
