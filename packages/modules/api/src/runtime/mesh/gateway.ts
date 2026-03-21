export function createHandler(mesh) {
  return async (req, res) => {
    const result = await mesh.execute(req.body.query, req.body.variables, req.context)
    res.json(result)
  }
}
