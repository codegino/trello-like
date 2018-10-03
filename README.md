# trello-like

How to run project

Pre-requisite : node.js should already be installed in the machine
Download link : https://nodejs.org/en/download/

Once complete follow the steps below

1. Open command line and install the following node packages *If not yet installed*
	- npm -g install static-server
	- npm -g json-server

2. Open a command line and go to the /src folder of the project

3. Execute 'static-server -p 8080'. Just change 8080 to any port if not available

4. Open a new command line and go the /src/resources of the project

5. Execute 'json-server --watch db.json'

6. Open web browser and go to localhost:8080 *Google chrome recommended*