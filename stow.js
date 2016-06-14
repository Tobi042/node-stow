module.exports = {
  createCache: function createCache (Backend, options) {
    return new Cache(Backend, options)
  },
  Cache: Cache
}

function Cache (Backend, options) {
  var opts = options || {}
  opts.ttl = opts.ttl || 0
  this.backend = new Backend(opts)
}

Cache.prototype.set = function (key, data, ttl, tags, cb) {
  var options = {}

  // Support set(options, cb) style calling.
  if (typeof key !== 'string') {
    Object.keys(key).forEach(function (k) {
      options[k] = key[k]
    })
    cb = data
  // Parse arguments.
  } else {
    options.key = key
    options.data = data
    if (typeof ttl === 'function') {
      cb = ttl
    } else if (typeof tags === 'function') {
      cb = tags
      if (typeof ttl === 'number') {
        options.ttl = ttl
      } else {
        options.tags = ttl
      }
    } else {
      options.ttl = ttl
      options.tags = tags
    }
  }

  if (typeof options.key === 'undefined') {
    return cb(new Error('No key passed to cache.set()'))
  }
  if (typeof options.data === 'undefined') {
    return cb(new Error('No data passed to cache.set()'))
  }

  if (options.tags) {
    options.tags = this.flattenTags(options.tags)
  }

  this.backend.set(options, cb)
}

Cache.prototype.get = function (key, cb) {
  this.backend.get(key, cb)
}

Cache.prototype.invalidate = function (tags, cb) {
  this.backend.invalidate(this.flattenTags(tags), cb)
}

Cache.prototype.clear = function (pattern, cb) {
  if (typeof pattern === 'function') {
    cb = pattern
    pattern = '*'
  }
  this.backend.clear(pattern, cb)
}

Cache.prototype.flattenTags = function (tags) {
  var norm = []
  Object.keys(tags).forEach(function (key) {
    (Array.isArray(tags[key]) ? tags[key] : [tags[key]]).forEach(function (tag) {
      var flat = key + ':' + tag
      if (norm.indexOf(flat) < 0) {
        norm.push(flat)
      }
    })
  })
  return norm
}
