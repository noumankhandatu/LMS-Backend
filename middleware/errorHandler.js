function handleErrorResponse(res, error) {
  const stringError = error.toString();
  return res.status(500).send({ message: stringError });
}

module.exports = { handleErrorResponse };
