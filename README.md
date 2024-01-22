# Introduction 
App to offer insight into IOL consignments with a 360° view from order, to surgeries, to expiring stock, and all the connections and relationships of the various data.

# Getting Started

## Development Db

### Connection
In order to connect to the PostgreSQL Db, the developer should add a directory at the root of this project called:
./secrets/configuration.json
Add database credentials under the "db" property similiar to the following:
```
{
    "db": {
        "host": "localhost",
        "port": 5432,
        "user": "postgres",
        "password": "password"
    }
}
```
### Restore
TODO: This should become part of the build process in the future and not need done manually.

To setup a fresh instance of the IOL schema in PostgreSQL execute all queries in ./dbo/create/ in the following order:
1. iol_schema
2. sequences
3. types
4. ...the rest (which depend on sequences and types) 

## Updating Consignment Data
IOL data can be found on the internal drive: `\\blfslaxcom05\SalesOperations\PeopleSoft Data\IOL_Downloads`
Grab the latest CSV and run the copy command for *iol.consignments* in the file: *./dbo/insert/insert_from_csv.sql*

## Updating Territories and Roles
Currently we leverage a multi-tab XLS to gather all the sales org RBD and STM positions.
Take the various tabs, copying the header along with the data from the first, and then just the data, no header, from the others. Paste everything into a text file with no empty lines between and no trailing lines.
Edit the file so that any column with commas in it is surrounded in quotes like so:

`USASUR-TER-1008	STM	Lohse	Thomas	314-753-1994	"St. Louis, MO, South IL"	01008005	BN9`

Also, replace any "RBD - Sx" with plain "RBD".

Note the 8 digit "ship_to" number is sometimes missing the leading left-pad zero. Don't worry so much about this as PG copy command below will fail and give the exact line that needs to be fixed. We can leverage that feedback, edit/save and retry the COPY command (it either fully works or fully fails).

Save the text file with the following name IN THE FOLLOWING LOCATION:
`C:\postgres\territories_and_roles.txt`

Run the following commands in PostgreSQL:
```
TRUNCATE iol.territories_and_roles;~
COPY iol.territories_and_roles(
	territory_id,
    role,
    last_name,
    first_name,
    phone,
    geo,
    ship_to,
    warehouse)
FROM 'C:\postgres\territories_and_roles.txt'
DELIMITER E'\t'
ESCAPE '\'
CSV HEADER
ENCODING 'windows-1252';
```
At this point we have inserted an up-to-date sales org, but with no roles and no hint at hierachy. We also are missing the ASDs. Next, we need to ensure look at the latest Surgical Roster and coordinate (somewhat painstakingly) visually the relations from ASD to RBD to STM in the file: *./dbo/insert/sales_reports_to_updates.sql*.

Finally, after updating the update statements, run the entire set of statements found in the file in PG. This will add the ASDs and populate the "reports_to" column of the representative table "territories_and_roles".

# Depolyment for use - Docker TRAC
## Build react app.
npm run build
## Bundle everything for server and built React app.
docker build -t lindben/trac-server .
## Save the built image into a tar.
docker save lindben/trac-server > trac-server.tar
## Put to remote server.
scp  -r ~/trac-server.tar svc_trac.t1@161.242.88.26:~
## Log on and load image.
ssh svc_trac.t1@161.242.88.26
docker load < trac-server.tar
## Run in background, with automatic restart
docker run -p 3000:1234 -e NODE_ENV=production --restart unless-stopped -d --name trac-server lindben/trac-server
## Get to bash on running container (for debugging, adjusting port settings, etc.)
docker exec -it trac-server /bin/bash

