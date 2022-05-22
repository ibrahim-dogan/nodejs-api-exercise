const {Op} = require("sequelize");
const {Contract} = require("../model");
const HttpError = require("../httpError");

/**
 * @param id
 * @param profileId
 * @return users contract by id
 */
const getContractWithId = async ({id, profileId}) => {
    const contract = await Contract.findOne({
        where: {id, [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}]},
    });

    if (!contract) {
        throw new HttpError(404, "Contract not found")
    }

    return contract;
}

/**
 * @param profileId
 * @returns all active contacts of user
 */
const getAllContractsOfProfile = async ({profileId}) => {
    return await Contract.findAll({
        where: {
            [Op.not]: [{status: 'terminated'}], [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
        },
    });
}

module.exports = {getContractWithId, getAllContractsOfProfile};