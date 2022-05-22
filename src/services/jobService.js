const {Op} = require("sequelize");
const {Contract, Job, sequelize, Profile} = require("../model");
const HttpError = require("../httpError");

/**
 * @param profileId
 * @returns all unpaid jobs of profile
 */
const getUnpaidJobsOfProfile = async ({profileId}) => {
    return await Job.findAll({
        where: {
            paid: {[Op.not]: true},
        }, include: [{
            model: Contract, where: {
                [Op.not]: [{status: 'terminated'}],
                [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
            }
        }]
    });
}

/**
 * Updates job as paid and transfers money from client to contractor
 * @param jobId
 * @param profile
 * @returns job object
 */
const profilePayForJobById = async ({jobId, profile}) => {
    return await sequelize.transaction(async (transaction) => {
        const job = await Job.findOne({
            where: {
                id: jobId, paid: {
                    [Op.not]: true,
                },
            }, include: [{
                model: Contract, where: {
                    [Op.not]: [{status: "terminated"}],
                    ClientId: profile.id,
                },
            },],
        }, {transaction});

        if (!job || !job.Contract) {
            throw new HttpError(404, "Job is not found or already paid.");
        }

        if (profile.balance < job.price) {
            throw new HttpError(400, "Balance is not enough.");
        }

        job.paid = true;
        job.paymentDate = new Date().toISOString();

        await Promise.all([
            await Profile.increment('balance', {by: job.price, where: {id: job.Contract.ContractorId}, transaction}),
            await Profile.decrement('balance', {by: job.price, where: {id: profile.id}, transaction}),
            job.save({transaction}),
        ]);

        return job;
    });
}


module.exports = {getUnpaidJobsOfProfile, profilePayForJobById};