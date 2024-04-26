import Redis from 'ioredis';
import Safety from './safety.mjs';
import Keyv from 'keyv';

const memkv = new Keyv();
const redis = Safety.env.USE_REDIS === 'true' ? new Redis(Safety.env.REDIS_URL) : null;

class KV {
    async get(key) {
        if (Safety.env.USE_REDIS === 'true' && redis) {
            return await redis.get(key);
        } else {
            return await memkv.get(key);
        }
    }

    async set(key, value) {
        if (Safety.env.USE_REDIS === 'true' && redis) {
            const setResult = await redis.set(key, value);
            return setResult === 'OK';
        } else {
            const setResult = await memkv.set(key, value);
            return setResult;
        }
    }

    async setTTL(key, value, ttl) {
        if (Safety.env.USE_REDIS === 'true' && redis) {
            const setResult = await redis.set(key, value, 'EX', ttl);
            return setResult === 'OK';
        } else {
            const setResult = await memkv.set(key, value, { ttl: ttl * 1000 });
            return setResult;
        }
    }
}

export default new KV();

