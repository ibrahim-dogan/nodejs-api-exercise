const contractService = require('../services/contractService')

const getContract = async (req, res, next) => {
    const {id} = req.params;

    try {
        const contract = await contractService.getContractWithId({id, profileId: req.profile.id});
        res.json(contract);
    } catch (err) {
        next(err)
    }
};

const getContracts = async (req, res) => {
    const contracts = await contractService.getAllContractsOfProfile({profileId: req.profile.id});
    res.json(contracts);
};

module.exports = {
    getContract,
    getContracts,
};
