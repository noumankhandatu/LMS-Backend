function handleErrorResponse(res, error) {
  return res.status(500).send({ message: error });
}

module.exports = { handleErrorResponse };
