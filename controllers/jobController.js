const { pushJob } = require("../jobs/jobQueue");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createJob = async (req, res) => {
  const { learningRate, epoch, batchSize } = req.body;

  try {
    const existing = await prisma.job.findFirst({
      where: { learningRate, epoch, batchSize },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Job already exists", job: existing });
    }

    const newJob = await prisma.job.create({
      data: {
        learningRate,
        epoch,
        batchSize,
        status: "PENDING",
      },
    });

    pushJob({
      id: newJob.id,
      learningRate,
      epoch,
      batchSize,
    });

    res.status(201).json({ message: "Job created", job: newJob });
  } catch (error) {
    console.error("createJob error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRunningJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "RUNNING" },
    });

    const result = jobs.map((job) => ({
      jobId: job.id,
      currentEpoch: `${job.currentEpoch}/${job.epoch}`,
      currentAccuracy: job.currentAccuracy,
      currentLoss: job.currentLoss,
      learningRate: job.learningRate,
      progress:
        job.epoch > 0 ? Math.round((job.currentEpoch / job.epoch) * 100) : 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("getRunningJobs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCompletedJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: { in: ["SUCCEEDED", "FAILED"] },
      },
    });

    const result = jobs.map((job) => ({
      key: job.id,
      status: job.status,
      jobID: job.id,
      lr: job.learningRate,
      epoch: job.epoch,
      batch: job.batchSize,
      startAt: job.createdAt,
      duration: job.duration,
      finalAccuracy: job.finalAccuracy,
      finalLoss: job.finalLoss,
    }));

    res.json(result);
  } catch (error) {
    console.error("getCompletedJobs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resumeJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return res.status(404).json({ message: "Job not found" });

    await prisma.job.update({
      where: { id },
      data: {
        status: "PENDING",
        currentEpoch: 0,
        currentAccuracy: 0,
        currentLoss: 0,
        startAt: new Date(),
      },
    });

    pushJob({
      id: job.id,
      learningRate: job.learningRate,
      epoch: job.epoch,
      batchSize: job.batchSize,
    });

    res.json({ message: "Job resumed" });
  } catch (error) {
    console.error("resumeJob error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);

  try {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    await prisma.job.delete({ where: { id } });

    res.json({ message: "Job deleted" });
  } catch (error) {
    console.error("deleteJob error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getJobSummary = async (req, res) => {
  try {
    const [runningCount, successCount, failedCount, best] = await Promise.all([
      prisma.job.count({ where: { status: { in: ["RUNNING", "PENDING"] } } }),
      prisma.job.count({ where: { status: "SUCCEEDED" } }),
      prisma.job.count({ where: { status: "FAILED" } }),
      prisma.job.findFirst({
        where: { status: "SUCCEEDED" },
        orderBy: { finalAccuracy: "desc" },
        select: { finalAccuracy: true },
      }),
    ]);

    res.json({
      runningCount,
      successCount,
      failedCount,
      bestAccuracy: best?.finalAccuracy || 0,
    });
  } catch (error) {
    console.error("getJobSummary error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
