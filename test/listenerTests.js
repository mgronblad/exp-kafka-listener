const through = require("through2");
const xprKafkaListener = require("..");
const helper = require("./kafkaHelper");
const assert = require("assert");

// Note requires running kafka instance on localhost:9092

describe("exp-kafka-listener", () => {
  let topic1, topic2;
  before(helper.init);
  before((done) => {
    helper.createTopic((err, name) => {
      topic1 = name;
      done(err);
    });
  });
  before((done) => {
    helper.createTopic((err, name) => {
      topic2 = name;
      done(err);
    });
  });
  describe("#listen to one topic", () => {
    const group = `test-group-${helper.randomString(5)}`;
    let listener;
    it("should emit 'ready' event once connected to kakfa", (done) => {
      listener = xprKafkaListener.listen({ host: "localhost:9092" }, group, [topic1]);
      listener.on("ready", done);
    });

    it("should give is us a working message stream via the readStream property", (done) => {
      const receivedMsgs = [];
      const msgHandler = through.obj((msg, _enc, cb) => {
        receivedMsgs.push(String(msg.value));
        if (receivedMsgs.length === msgs.length) {
          assert.deepEqual(msgs, receivedMsgs);
          done();
        }
        cb();
      });
      const msgs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);
      msgs.forEach((m) => helper.send(topic1, m));
      listener.readStream.pipe(msgHandler);
    });
  });

  describe("#listen to multiple topics", () => {
    const group = `test-group-${helper.randomString(5)}`;
    let listener;
    it("should emit 'ready' event once connected to kakfa", (done) => {
      listener = xprKafkaListener.listen({ host: "localhost:9092" }, group, [topic1, topic2]);
      listener.on("ready", done);
    });

    it("should give is us a workig message stream via the readStream property", (done) => {
      const receivedMsgs = [];
      const msgHandler = through.obj((msg, _enc, cb) => {
        receivedMsgs.push(String(msg.value));
        if (receivedMsgs.length === msgs.length) {
          assert.deepEqual(msgs, receivedMsgs.sort());
          done();
        }
        cb();
      });
      const msgs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);
      msgs.forEach((m, i) => {
        const topic = (i % 2 === 0) ? topic1 : topic2;
        helper.send(topic, m);
      });
      listener.readStream.pipe(msgHandler);
    });
  });
});