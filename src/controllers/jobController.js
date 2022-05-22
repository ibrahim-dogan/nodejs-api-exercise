const jobService = require("../services/jobService")

const getUnpaidJobs = async (req, res) => {
    const profileId = req.profile.id;
    const jobs = await jobService.getUnpaidJobsOfProfile({profileId});
    res.json(jobs);
};

const payForJob = async (req, res, next) => {
    const {jobId} = req.params;
    const profile = req.profile;

    try {
        const job = await jobService.profilePayForJobById({jobId, profile});
        res.json(job);
    } catch (error) {
        return next(error);
    }

};

module.exports = {
    getUnpaidJobs,
    payForJob,
};
