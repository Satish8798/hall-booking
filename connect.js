const { MongoClient } = require("mongodb");

module.exports = {
  selectedDb: {},
  async connect() {
    try {
      const client = await MongoClient.connect(process.env.MONGODB_URL);
      this.selectedDb = client.db("day49_task");
      console.log("connected to database");
    } catch (error) {
      console.error(error);
    }
  },
};
