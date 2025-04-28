const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.post("/jobs", jobController.createJob);
router.get("/jobs/running", jobController.getRunningJobs);
router.get("/jobs/completed", jobController.getCompletedJobs);
router.post("/jobs/:id/resume", jobController.resumeJob);
router.delete("/jobs/:id", jobController.deleteJob);
router.get("/jobs/summary", jobController.getJobSummary);

module.exports = router;
