const adminService = require("../services/adminService")

const getBestProfession = async (req, res) => {
    const {start, end} = req.query;
    const result = await adminService.getBestProfession({start, end});

    res.json(result);
};

const getBestClient = async (req, res) => {
    const {start, end, limit = 2} = req.query;
    const results = await adminService.getBestClients({start, end, limit});

    res.json(results);
};

module.exports = {
    getBestProfession,
    getBestClient,
};
