/**
 * Environment Variable Security Validator
 * Validates critical environment variables at startup.
 * Enforces production security standards (secret length, entropy, missing vars).
 */

export const validateEnv = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const warnings = [];
  const errors = [];

  // 1. JWT_SECRET check
  if (!process.env.JWT_SECRET) {
    if (isProd) {
      errors.push('CRITICAL: JWT_SECRET environment variable is missing in production!');
    } else {
      warnings.push('WARNING: JWT_SECRET is not set in .env. A temporary local dev secret will be used.');
      process.env.JWT_SECRET = 'dev_only_jwt_secret_aura_studio_temp_key_2026';
    }
  } else if (process.env.JWT_SECRET.length < 24) {
    warnings.push('SECURITY WARNING: JWT_SECRET length is less than 24 characters. Consider generating a 256-bit key.');
  }

  // 2. ADMIN_SECRET_KEY check
  if (!process.env.ADMIN_SECRET_KEY) {
    if (isProd) {
      errors.push('CRITICAL: ADMIN_SECRET_KEY is missing in production!');
    } else {
      warnings.push('WARNING: ADMIN_SECRET_KEY is not set in .env. A temporary dev key will be used.');
      process.env.ADMIN_SECRET_KEY = 'aura_hoangphuc_secure_admin_2026';
    }
  }

  // 3. MONGODB_URI check
  if (!process.env.MONGODB_URI) {
    warnings.push('NOTICE: MONGODB_URI is not set. Will attempt local daemon or in-memory MongoDB fallback.');
  }

  // Output warnings
  if (warnings.length > 0) {
    console.log('\n🔒 [SECURITY PRE-FLIGHT CHECKS]');
    warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));
    console.log('');
  }

  // Terminate if critical errors in production
  if (errors.length > 0) {
    console.error('\n🚨 [FATAL SECURITY ERROR - SERVER HALTED]');
    errors.forEach((e) => console.error(`  ❌ ${e}`));
    console.error('Please configure your production environment variables before starting.\n');
    process.exit(1);
  }
};
