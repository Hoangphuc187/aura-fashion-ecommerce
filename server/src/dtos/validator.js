import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Enterprise Lightweight DTO Validator Engine
 * Validates request payload, strips undeclared fields, ensures strict types & business rules.
 */
export const validateDto = (schemaDefinition) => {
  return (req, res, next) => {
    const errors = [];
    const sanitizedBody = {};

    // Validate body if rules defined
    if (schemaDefinition.body) {
      const bodyRules = schemaDefinition.body;
      const actualBody = req.body || {};

      for (const [field, rule] of Object.entries(bodyRules)) {
        const val = actualBody[field];

        // 1. Required Check
        if (rule.required && (val === undefined || val === null || val === '')) {
          errors.push({
            field,
            rule: 'required',
            message: rule.message || `Trường '${field}' là bắt buộc`,
          });
          continue;
        }

        // If optional and missing, skip further checks
        if ((val === undefined || val === null || val === '') && !rule.required) {
          if (rule.default !== undefined) {
            sanitizedBody[field] = typeof rule.default === 'function' ? rule.default() : rule.default;
          }
          continue;
        }

        // 2. Type Check
        if (rule.type) {
          if (rule.type === 'array') {
            if (!Array.isArray(val)) {
              errors.push({
                field,
                rule: 'type',
                message: rule.message || `Trường '${field}' phải là một mảng`,
              });
              continue;
            }
          } else if (rule.type === 'number') {
            const num = Number(val);
            if (isNaN(num)) {
              errors.push({
                field,
                rule: 'type',
                message: rule.message || `Trường '${field}' phải là một số hợp lệ`,
              });
              continue;
            }
          } else if (typeof val !== rule.type) {
            errors.push({
              field,
              rule: 'type',
              message: rule.message || `Trường '${field}' phải có kiểu dữ liệu là ${rule.type}`,
            });
            continue;
          }
        }

        // 3. String Length / Range
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (rule.minLength && trimmed.length < rule.minLength) {
            errors.push({
              field,
              rule: 'minLength',
              message: rule.message || `Trường '${field}' phải có độ dài tối thiểu ${rule.minLength} ký tự`,
            });
            continue;
          }
          if (rule.maxLength && trimmed.length > rule.maxLength) {
            errors.push({
              field,
              rule: 'maxLength',
              message: rule.message || `Trường '${field}' không được vượt quá ${rule.maxLength} ký tự`,
            });
            continue;
          }
          if (rule.regex && !rule.regex.test(trimmed)) {
            errors.push({
              field,
              rule: 'format',
              message: rule.message || `Trường '${field}' không đúng định dạng quy định`,
            });
            continue;
          }
          sanitizedBody[field] = trimmed;
        } else if (typeof val === 'number') {
          if (rule.min !== undefined && val < rule.min) {
            errors.push({
              field,
              rule: 'min',
              message: rule.message || `Trường '${field}' phải có giá trị lớn hơn hoặc bằng ${rule.min}`,
            });
            continue;
          }
          if (rule.max !== undefined && val > rule.max) {
            errors.push({
              field,
              rule: 'max',
              message: rule.message || `Trường '${field}' phải có giá trị nhỏ hơn hoặc bằng ${rule.max}`,
            });
            continue;
          }
          sanitizedBody[field] = val;
        } else {
          sanitizedBody[field] = val;
        }

        // 4. Custom Validator Function
        if (rule.custom && typeof rule.custom === 'function') {
          const customResult = rule.custom(val, actualBody);
          if (customResult !== true) {
            errors.push({
              field,
              rule: 'custom',
              message: typeof customResult === 'string' ? customResult : (rule.message || `Trường '${field}' không hợp lệ`),
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      return ApiResponse.error(res, {
        statusCode: 400,
        errorCode: 'VALIDATION_FAILED',
        message: 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.',
        errors,
      });
    }

    // Attach sanitized DTO to request
    req.dto = sanitizedBody;
    next();
  };
};

export default validateDto;

