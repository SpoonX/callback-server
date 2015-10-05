var http        = require('http'),
    querystring = require('querystring'),
    subtext     = require('subtext'),
    fs          = require('fs'),
    logFile     = process.env.LOG_FILE || __dirname + '/callbacks.log',
    port        = process.env.PORT || 9615;

http.createServer(function (req, res) {
  subtext.parse(req, null, {parse: true, output: 'data'}, function (err, parsed) {
    var body = parsed.payload;

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();

    var logData = [
      '> Log time: ' + logTime() + '',
      '[Request]: ' + req.url,
      '[Headers]:', formatObject(req.headers),
      '[Body]:', formatObject(body),
      '---------------------------\n'
    ];

    fs.appendFile(logFile, logData.join('\n'), function (error) {
      if (error) {
        console.error(error);
      }
    });
  });
}).listen(port);

console.log('Now logging on http://127.0.0.1:' + port)

// Functions
function logTime() {
  var currentDate = new Date();

  return [
    currentDate.getFullYear(),
    ensureDoubleDigit((currentDate.getMonth() + 1)),
    ensureDoubleDigit(currentDate.getDate())
  ].join('-') + ' ' + [
    ensureDoubleDigit(currentDate.getHours()),
    ensureDoubleDigit(currentDate.getMinutes()),
    ensureDoubleDigit(currentDate.getSeconds())
  ].join(':');
}

function ensureDoubleDigit(number) {
  if (number < 10) {
    number = '0' + number;
  }

  return number;
}

function formatObject(object, prefix) {
  if (!object) {
    return 'None';
  }

  if (typeof object === 'string') {
    return object;
  }

  prefix = prefix || '  -';

  var formatted = [];

  Object.getOwnPropertyNames(object).forEach(function (property) {
    var value           = object[property],
        formattedString = prefix;

    if (!Array.isArray(object)) {
      formattedString += property + ': ';
    } else if ('length' === property) {
      return;
    }

    if (typeof value === 'object') {
      value = '\n' + formatObject(value, ' ' + prefix);
    }

    formatted.push(formattedString + value);
  });

  return formatted.join('\n');
}