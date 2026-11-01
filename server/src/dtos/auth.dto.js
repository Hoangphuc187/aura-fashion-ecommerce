/**
 * Authentication DTOs (Data Transfer Objects)
 */

export const RegisterDtoSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 60,
      message: 'Họ và tên phải từ 2 đến 60 ký tự',
    },
    email: {
      required: true,
      type: 'string',
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Định dạng email không hợp lệ',
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128,
      message: 'Mật khẩu phải chứa ít nhất 8 ký tự',
      custom: (val) => {
        // Enforce basic enterprise password strength: at least 1 number or special char
        if (!/(?=.*[0-9])|(?=.*[!@#$%^&*])/.test(val)) {
          return 'Mật khẩu phải chứa ít nhất một chữ số hoặc ký tự đặc biệt';
        }
        return true;
      },
    },
    phone: {
      required: false,
      type: 'string',
      regex: /^(0|\+84)[0-9]{9,10}$/,
      message: 'Số điện thoại không đúng định dạng Việt Nam',
    },
  },
};

export const LoginDtoSchema = {
  body: {
    email: {
      required: true,
      type: 'string',
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email đăng nhập không hợp lệ',
    },
    password: {
      required: true,
      type: 'string',
      minLength: 1,
      message: 'Vui lòng nhập mật khẩu',
    },
    otp: {
      required: false,
      type: 'string',
      minLength: 6,
      maxLength: 6,
      message: 'Mã xác thực 2FA OTP phải gồm đúng 6 chữ số',
    },
  },
};

export const Verify2faDtoSchema = {
  body: {
    tempToken: {
      required: true,
      type: 'string',
      message: 'Phiên xác thực tạm thời không hợp lệ',
    },
    otp: {
      required: true,
      type: 'string',
      regex: /^[0-9]{6}$/,
      message: 'Mã OTP phải gồm 6 chữ số',
    },
  },
};

/**
 * Output Serializer DTO: Strips internal sensitive fields and maps public UUID
 */
export class UserResponseDto {
  static transform(user) {
    if (!user) return null;
    const doc = user.toObject ? user.toObject() : user;

    return {
      id: doc._id?.toString(),
      uuid: doc.uuid || doc._id?.toString(), // Public safe UUID
      name: doc.name,
      email: doc.email,
      role: doc.role,
      avatar: doc.avatar,
      phone: doc.phone || '',
      authProvider: doc.authProvider || 'local',
      twoFactorEnabled: !!doc.twoFactorEnabled,
      createdAt: doc.createdAt,
    };
  }
}

