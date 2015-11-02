require('babel/register')({
    optional: [
        'es7.asyncFunctions'
    ]
})

var runner = require('./lib/runner')

var pause = 5000

console.log('Marathon monitor running')
repeat()

function repeat() {
    runner()
        .then(function() {
            setTimeout(repeat, pause)
        }, function(e) {
            console.error('Marathon monitor error:')
            console.error(e.stack || e)
            process.exit(1)
        })
}
