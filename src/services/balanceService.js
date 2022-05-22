const {Op} = require("sequelize");
const {Contract, Job, Profile, sequelize} = require("../model");
const HttpError = require("../httpError");

/**
 * Deposits balance to user
 * @param userId
 * @param depositAmount
 * @returns client object
 */
const depositBalanceToUser = async ({userId, depositAmount}) => {

    if (!depositAmount) {
        throw new HttpError(400, "depositAmount field is required.")
    }

    if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new HttpError(400, "depositAmount should be positive.")
    }

    return await sequelize.transaction(async (t) => {

        const client = await Profile.findByPk(userId, {transaction: t});

        if (!client || client.type !== 'client') {
            throw new HttpError(404, 'Client not found')
        }

        const unpaidJobs = await Job.findOne({
            attributes: [[sequelize.fn('sum', sequelize.col('price')), 'total']],
            where: {
                paid: {
                    [Op.not]: true,
                },
            },
            include: [
                {
                    model: Contract,
                    where: {
                        [Op.not]: [{status: "terminated"}],
                        ClientId: userId,
                    },
                },
            ],
            raw: true
        });

        const depositThreshold = unpaidJobs.total * 0.25;

        if (!unpaidJobs.total || depositAmount > depositThreshold) {
            throw new HttpError(400, "depositAmount can not be greater more than 25% total of your unpaidJobs to pay")
        }

        client.balance = client.balance + depositAmount;

        await client.save({transaction: t});

        return client;
    });


}

module.exports = {depositBalanceToUser};