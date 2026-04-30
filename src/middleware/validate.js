const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, _res, next) => {
    const validationTargets = {};

    if (schema.body) validationTargets.body = req.body;
    if (schema.params) validationTargets.params = req.params;
    if (schema.query) validationTargets.query = req.query;

    const errors = [];

    for (const [source, sourceSchema] of Object.entries(schema)) {
      const { error, value } = sourceSchema.validate(validationTargets[source], {
        abortEarly: false,
        stripUnknown: true,
        errors: { wrap: { label: false } },
      });

      if (error) {
        const sourceErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          source,
        }));
        errors.push(...sourceErrors);
      } else {
        req[source] = value;
      }
    }

    if (errors.length > 0) {
      return next(AppError.badRequest('Validation failed', errors));
    }

    next();
  };
};

module.exports = validate;
