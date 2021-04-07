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
  operationalDb: {
    host: getRequiredParam("OPERATIONAL_DB_HOST"),
    name: getRequiredParam("OPERATIONAL_DB_NAME"),
    user: getRequiredParam("OPERATIONAL_DB_USER"),
    password: getRequiredParam("OPERATIONAL_DB_PASSWORD"),
  },
  analyticsDb: {
    host: getRequiredParam("ANALYTICS_DB_HOST"),
    name: getRequiredParam("ANALYTICS_DB_NAME"),
    user: getRequiredParam("ANALYTICS_DB_USER"),
    password: getRequiredParam("ANALYTICS_DB_PASSWORD"),
  },
}

export default config
