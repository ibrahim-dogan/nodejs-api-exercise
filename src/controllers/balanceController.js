const balanceService = require("../services/balanceService")

const depositBalance = async (req, res, next) => {
    const {userId} = req.params;
    const {depositAmount} = req.body;

    try {
        const profile = await balanceService.depositBalanceToUser({userId, depositAmount});
        res.json(profile);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    depositBalance
};
