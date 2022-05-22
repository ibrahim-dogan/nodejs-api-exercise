const {Op} = require("sequelize");
const {Contract, Job, Profile, sequelize} = require("../model");

/**
 * @param start
 * @param end
 * @returns best profession and earned amount between dates
 */
const getBestProfession = async ({start, end}) => {
    const result = await Job.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
        include: [{
            model: Contract,
            required: true,
            include: [
                {
                    model: Profile,
                    required: true,
                    as: 'Contractor'
                }
            ]
        }],
        where: {
            paymentDate: {[Op.between]: [start, end]},
            paid: true
        },
        group: ['Contract.Contractor.profession'],
        order: [[sequelize.col('total'), 'DESC']],
    });

    if (!result) {
        return null
    }

    return {
        totalEarned: result.dataValues.total,
        profession: result.Contract.Contractor.profession
    }
}

/**
 * @param start
 * @param end
 * @param limit
 * @returns best clients between dates and limit
 */
const getBestClients = async ({start, end, limit}) => {
    const results = await Job.findAll({
        raw: true,
        attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
        include: [{
            model: Contract,
            required: true,
            include: [
                {
                    model: Profile,
                    required: true,
                    as: 'Client'
                }
            ]
        }],
        where: {
            paymentDate: {[Op.between]: [start, end]},
            paid: true
        },
        group: ['Contract.ClientId'],
        order: [[sequelize.col('total'), 'DESC']],
        limit
    });

    return results.map(result => ({
            id: result['Contract.Client.id'],
            paid: result.total,
            fullName: `${result['Contract.Client.firstName']} ${result['Contract.Client.lastName']}`
        })
    );
}

module.exports = {getBestProfession, getBestClients};