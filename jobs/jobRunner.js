const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { spawn } = require("child_process");
const path = require("path");

function sendJobUpdate(jobId, data) {
  const message = {
    type: "jobUpdate",
    jobId,
    ...data,
  };
}

async function runJob() {
  const [, , jobId, learningRate, totalEpoch, batchSize] = process.argv;

  console.log(`Job ${jobId} started`);

  const startAt = new Date();
  let currentAccuracy = 0;
  let currentLoss = 0;

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "RUNNING", startAt },
    });

    sendJobUpdate(jobId, { status: "RUNNING" });

    const pythonScriptPath = path.join(__dirname, "mnistTrainer.py");
    const pythonArgs = [
      pythonScriptPath,
      jobId,
      learningRate,
      batchSize,
      totalEpoch,
    ];

    const pythonProcess = spawn("python", pythonArgs);

    pythonProcess.stdout.on("data", async (data) => {
      const message = data.toString().trim();
      console.log(`[Python stdout] ${message}`);

      const match = message.match(
        /Epoch (\d+), Loss: ([\d\.]+), Accuracy: ([\d\.]+)%/
      );
      if (match) {
        const epoch = parseInt(match[1]);
        currentLoss = parseFloat(match[2]);
        currentAccuracy = parseFloat(match[3]);

        const progress = Math.floor((epoch / totalEpoch) * 100);

        await prisma.job.update({
          where: { id: jobId },
          data: {
            currentEpoch: epoch,
            currentLoss,
            currentAccuracy,
            progress,
          },
        });

        sendJobUpdate(jobId, {
          currentEpoch: epoch,
          currentLoss,
          currentAccuracy,
          progress,
        });

        await prisma.log.create({
          data: {
            jobId,
            epoch,
            trainLoss: currentLoss,
            valLoss: currentLoss * 0.95,
            accuracy: currentAccuracy,
            time: 1,
          },
        });
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python error ${data.toString()}`);
    });

    pythonProcess.on("exit", async (code) => {
      if (code === 0) {
        const endAt = new Date();
        const job = await prisma.job.findUnique({
          where: { id: jobId },
          select: { startAt: true },
        });

        const duration = Math.floor(
          (endAt.getTime() - job.startAt.getTime()) / 1000
        );

        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: "SUCCEEDED",
            finalAccuracy: parseFloat(currentAccuracy.toFixed(2)),
            finalLoss: parseFloat(currentLoss.toFixed(2)),
            endAt,
            duration,
          },
        });

        sendJobUpdate(jobId, { status: "SUCCEEDED" });
        console.log(`Job ${jobId} finished successfully`);
      } else {
        console.error(`[Job ${jobId}] failed`);
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "FAILED" },
        });

        sendJobUpdate(jobId, { status: "FAILED" });
      }

      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error(`[Job ${jobId}] failed:`, error);

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "FAILED" },
    });

    sendJobUpdate(jobId, { status: "FAILED" });

    await prisma.$disconnect();
    process.exit(1);
  }
}

runJob();
