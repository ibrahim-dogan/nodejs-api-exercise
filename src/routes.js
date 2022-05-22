const {getProfile} = require("./middlewares/getProfile");
const {getContract, getContracts} = require("./controllers/contractController");
const {getUnpaidJobs, payForJob} = require("./controllers/jobController");
const {depositBalance} = require("./controllers/balanceController");
const {getBestProfession, getBestClient} = require("./controllers/adminController");
const router = require("express").Router();

/**
 * Health check
 */
router.get('/_health', (req, res) => {
    res.send('ok')
})

/**
 * @returns contract by id
 */
router.get("/contracts/:id", getProfile, getContract);

/**
 * @returns non terminated contracts
 */
router.get("/contracts", getProfile, getContracts);

/**
 * @returns unpaid jobs for active contracts
 */
router.get("/jobs/unpaid", getProfile, getUnpaidJobs);

/**
 * Client pays for a job
 */
router.post("/jobs/:jobId/pay", getProfile, payForJob);

/**
 * Deposits money into the balance of a client
 */
router.post("/balances/deposit/:userId", depositBalance);

/**
 * @returns the profession that earned the most money
 */
router.get("/admin/best-profession", getBestProfession);

/**
 * @returns the clients the paid the most for jobs
 */
router.get("/admin/best-clients", getBestClient);

module.exports = {router};