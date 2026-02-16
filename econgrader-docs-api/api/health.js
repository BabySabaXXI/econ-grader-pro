export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "econgrader-docs-api",
    version: "1.0.0",
  });
}
