const { spawn } = require("child_process");
const path = require("path");

exports.pushJob = (job) => {
  const jobRunnerPath = path.resolve(__dirname, "../jobs/jobRunner.js");

  const { id, learningRate, epoch, batchSize } = job;

  const jobProcess = spawn("node", [
    jobRunnerPath,
    id,
    learningRate,
    epoch,
    batchSize,
  ]);

  jobProcess.stdout.on("data", (data) => {
    console.log(`Job ${id} Output: ${data}`);
  });

  jobProcess.stderr.on("data", (data) => {
    console.error(`Job ${id} Error: ${data}`);
  });

  jobProcess.on("close", (code) => {
    console.log(`Job ${id}] exited with code ${code}`);
  });
};
