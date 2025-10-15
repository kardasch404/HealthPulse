import bcrypt from 'bcrypt';

class CryptoUtil {
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}

export default CryptoUtil;
