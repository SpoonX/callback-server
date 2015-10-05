# Callback server
An extremely server which does nothing more than logging all requests to file and responding with 200.

## Getting started
1. Simply clone this repository or download a release.
2. Run `npm install` from the project root.
3. From the project root run `npm start`.

To, for example, change the `LOG_FILE`, start the server as follows:

`LOG_FILE=/custom/log/file.log npm start`

## Environment variables
You can configure some things using environment variables.

### LOG_FILE
Path to the file to append log data to. Defaults to `./callbacks.log`/

### PORT
The port to run on. Defaults to `9615`.