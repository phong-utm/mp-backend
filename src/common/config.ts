function getRequiredParam(param: string) {
  const paramValue = process.env[param]
  if (!paramValue) {
    throw new Error(`Environment variable not found: ${param}`)
  }
  return paramValue
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(getRequiredParam("PORT")),
}

export default config
