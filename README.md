# kappa-core

> a small core for append-only log based programs

[kappa architecture](http://kappa-architecture.com)

a lot like [flumedb][flumedb], but using
[multifeed](https://github.com/noffle/multifeed) as an append-only log base,
which is actually a *set* of append-only logs

pronounced *"capricorn"*

## Status

*Experimental*

Mostly not even built! Right now this is more of a module sketch than anything
usable.

## Usage

```js
var kappa = require('kappa-core')
var hypercore = require('hypercore')
var view = require('kappa-core-view')

var core = kappa(hypercore, './log', { valueEncoding: 'json' })

var sum = 0

// the api of flumeview-reduce will be mounted at db.sum...
core
  .use('sum', function (msgs, next) {
    msgs.forEach(function (msg) {
      if (typeof msg.value === 'number') sum += msg.value
    })
    next()
  })

var feed = core.feed('default')

feed.append(1, function (err) {
  core.sum.get(function (err, value) {
    console.log(value) // 1
  })
})
```

## API

```js
var kappa = require('kappa-core')
```

### var core = kappa(hypercore, storage, opts)

Create a new kappa-core database.

- `hypercore` is the value of `require('hypercore')` of the version of hypercore
  you'd like to use. It's passed in in this fashion so that kappa-core doesn't
  bind itself to a specific (and potentially broken or out of date) version of
  hypercore that you cannot change.
- `storage` is an instance of
  [random-access-storage](https://github.com/random-access-storage). If a string
  is given,
  [random-access-file](https://github.com/random-access-storage/random-access-storage)
  is used with the string as the filename.
- Valid `opts` include:
  - `valueEncoding`: a string describing how the data will be encoded.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install kappa-core
```

## Why?

[flumedb][flumedb] presents an ideal small core API for an append-only log:
append new data, and build (versioned) views over it. kappa-core copies this
gleefully, but with two major differences:

1. [hypercore][hypercore] is used for feed (append-only log) storage
2. views are built in out-of-order sequence

hypercore provides some very useful superpowers:

1. all data is cryptographically associated with a writer's public key
2. partial replication: parts of feeds can be selectively sync'd between peers,
instead of all-or-nothing, without loss of cryptographic integrity

Building views in arbitrary sequence is more challenging than when order is
known to be topographic, but confers some benefits:

1. most programs are only interested in the latest values of data; the long tail
of history can be traversed asynchronously at leisure after the tips of the
feeds are processed
2. the views are tolerant of partially available data. Many of the modules
listed in the section below depend on *topographic completeness*: all entries
referenced by an entry **must** be present for indexes to function. This makes
things like the equivalent to a *shallow clone* (think [git][git-shallow]),
where a small subset of the full dataset can be used and built on without
breaking anything.

## Acknowledgments

kappa-core is built atop ideas from a huge body of others' brilliant work:

- [flumedb][flumedb]
- [secure scuttlebutt](http://scuttlebutt.nz)
- [hypercore](https://github.com/mafintosh/hypercore)
- [hyperdb](https://github.com/mafintosh/hyperdb)
- [forkdb](https://github.com/substack/forkdb)
- [hyperlog](https://github.com/mafintosh/hyperlog)

## License

ISC

[flumedb]: https://github.com/flumedb/flumedb
[git-shallow]: https://www.git-scm.com/docs/gitconsole.log(one#gitconsole.log(one---depthltdepthgt)