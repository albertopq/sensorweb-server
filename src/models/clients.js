import { randomBytes } from 'crypto';

import config                    from '../config';
import { RECORD_ALREADY_EXISTS } from '../errors';

// XXX temporary store clients in memory.
let memStore = {};

exports.create = name => {
  if (memStore[name]) {
    return Promise.reject(new Error(RECORD_ALREADY_EXISTS));
  }
  const key = randomBytes(8).toString('hex');
  const secret = randomBytes(64).toString('hex');
  memStore[name] = {
    name,
    key,
    secret
  };
  return Promise.resolve(memStore[name]);
}

exports.getAll = () => {
  return Promise.resolve(Object.keys(memStore).map(key => {
    // Do not expose secret.
    return Object.assign({}, memStore[key], { secret: undefined });
  }));
}

exports.get = (key, includeSecret = false) => {
    if (!memStore[key]) {
      return Promise.resolve(null);
    }

    if (includeSecret) {
      return Promise.resolve(memStore[key]);
    }

    return Promise.resolve(
      Object.assign({}, memStore[key], { secret: undefined })
    );
}

exports.remove = key => {
  Object.keys(memStore).forEach(name => {
    if (memStore[name].key === key) {
      delete memStore[name];
      return Promise.resolve();
    }
  });
  return Promise.resolve();
}

exports.clear = () => {
  if (config.get('env') !== 'test') {
    return Promise.resolve();
  }
  memStore = {};
  return Promise.resolve();
}
