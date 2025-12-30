export function now(req) {
  if (process.env.TEST_MODE === "1") {
    const testNow = req.headers["x-test-now-ms"];
    if (testNow) {
      return new Date(Number(testNow));
    }
  }
  return new Date();
}
