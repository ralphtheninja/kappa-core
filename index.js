var hypercore = require('hypercore')
var multifeed = require('multifeed')
var indexer = require('multifeed-index')

module.exports = Kappa

function Kappa (storage, opts) {
  if (!(this instanceof Kappa)) return new Kappa(storage, opts)

  this._logs = multifeed(hypercore, storage, opts)
  this._indexes = {}

  this.api = {}
}

// TODO: support versions + checking to rebuild them
Kappa.prototype.use = function (name, view) {
  var idx = indexer({
    log: this._logs,
    maxBatch: view.maxBatch || 10,
    batch: view.map,
    fetchState: view.fetchState,
    storeState: view.storeState
  })
  if (view.indexed) idx.on('indexed', view.indexed)
  this._indexes[name] = idx
  this.api[name] = {}
  this.api[name].ready = idx.ready.bind(idx)
  for (var key in view.api) {
    if (typeof view.api[key] === 'function') this.api[name][key] = view.api[key].bind(idx, this)
    else this.api[name][key] = view.api[key]
  }
}

Kappa.prototype.ready = function (viewNames, cb) {
  if (typeof viewNames === 'function') {
    cb = viewNames
    viewNames = []
  }

  if (typeof viewNames === 'string') viewNames = [viewNames]
  if (viewNames.length === 0) {
    viewNames = Object.keys(this._indexes)
  }

  var pending = viewNames.length
  var self = this
  this._logs.ready(function () {
    for (var i=0; i < viewNames.length; i++) {
      self._indexes[viewNames[i]].ready(done)
    }
  })

  function done () {
    if (!--pending) cb()
  }
}

Kappa.prototype.feed = function (name, cb) {
  this._logs.writer(name, cb)
}

Kappa.prototype.replicate = function (opts) {
  return this._logs.replicate(opts)
}
