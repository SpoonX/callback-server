var http        = require('http'),
    querystring = require('querystring'),
    fs          = require('fs'),
    logFile     = process.env.LOG_FILE || __dirname + '/callbacks.log',
    port        = process.env.PORT || 9615;

http.createServer(function (req, res) {
  var body = '';

  res.writeHead(200, {'Content-Type': 'text/plain'});

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    res.end();

    if (req.headers['content-type']) {
      body = formatObject(parseBody(body, req.headers['content-type']));
    }

    var logData = [
      '> Log time: ' + logTime() + '',
      '[Request]: ' + req.url,
      '[Headers]:', formatObject(req.headers),
      '[Body]:', body,
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
function logTime () {
  var currentDate = new Date();
    
  return dformat       = [
    currentDate.getFullYear(),
    ensureDoubleDigit((currentDate.getMonth()+1)),
    ensureDoubleDigit(currentDate.getDate())
  ].join('-') + ' ' + [
    ensureDoubleDigit(currentDate.getHours()),
    ensureDoubleDigit(currentDate.getMinutes()),
    ensureDoubleDigit(currentDate.getSeconds())
  ].join(':');
}

function ensureDoubleDigit (number) {
  if (number < 10) {
    number = '0' + number;
  }

  return number;
}

function formatObject (object, prefix) {
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

function parseBody (body, contentType) {
  var contentTypeParts = contentType.split(';'),
      parsedBody       = {},
      boundaryMatches;

  if (contentTypeParts[0] !== 'multipart/form-data' || !contentTypeParts[1]) {
    return body;
  }

  boundaryMatches = contentTypeParts[1].match(/\bboundary\b=(\-{4}\b\w+\b)/);

  if (!boundaryMatches || !boundaryMatches[1] || !typeof boundaryMatches === 'string') {
    return body;
  }

  body.split(boundaryMatches[1]).forEach(function (bodyPart) {
    var bodyMatch = bodyPart.replace(/\s/g, '').match(/name="(.*?)"(.*?)--/),
        key,
        value;

    if (!bodyMatch) {
      return;
    }

    key   = bodyMatch[1];
    value = bodyMatch[2];

    if (key.match(/\[\]$/)) {
      key = key.replace(/\[\]$/, '');

      if (typeof parsedBody[key] === 'undefined') {
        parsedBody[key] = [];
      }

      return parsedBody[key].push(value);
    }

    parsedBody[key] = value;
  });

  return parsedBody;
}
