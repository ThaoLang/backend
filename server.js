const express = require("express");
const cors = require("cors");
const http = require("http");
const jobRoutes = require("./routes/jobRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", jobRoutes);

const server = http.createServer(app);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
