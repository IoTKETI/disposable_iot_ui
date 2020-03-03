Install guide
=============

## Table of Contents
1. Install Node.js
2. Install MongoDB
3. Install Small IOT Test & Verify Tool UI application 


## Install Node.js

1. Visit node.js homepage

   https://nodejs.org/ko/download/ 
    
1. Download & install
   1. Windows : Download Windows Installer (.msi) and double click it.
   1. Linux : Follow instructions on 
      
      https://nodejs.org/ko/download/package-manager/




## Install MongoDB

1. Visit MongoDB homepage

   https://www.mongodb.com

2. Download MongoDB Community Server

   1. Windows : Download Windows installer and double click it.
      https://www.mongodb.com/download-center?jmp=nav#community

   2. Linux : Follow instructions on 
      https://docs.mongodb.com/manual/administration/install-on-linux 

   3. Start MongoDB
   
      ```
      sudo service mongod start 
      ```

   5. Create admin user  ({{mongo-admin}}  / {{monog-admin-password}})

      ```   
      mongo --port 27017
      ```

      ```
      use admin
      db.createUser(
        {
          user: "{{mongo-admin}}",
          pwd: "{{mongo-admin-password}}",
          roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
        }
      )
      ```

   3. Authorization config
   
      ```
      vi /etc/mongod.conf
      ```

      ```
      systemLog:
       destination: file
       path: /usr/local/var/log/mongodb/mongo.log
       logAppend: true
      storage:
       dbPath: /usr/local/var/mongodb
      net:
       #bindIp: 127.0.0.1
       bindIp: 0.0.0.0
      
      security:
       authorization: "enabled"
      ```

   3. Restart

      ```
      sudo service mongod restart 
      ```

   4. Create user (iotvtool-user / keti12#$ )
      
      ```
      mongo --port 27017 -u "{{mongo-admin}}" -p "{{mongo-admin-password}}" --authenticationDatabase "admin"
      ```

      ```
      use iotvtool
      db.createUser(
        {
          user: "iotvtool-user",
          pwd: "keti12#$",
          roles: [ { role: "readWrite", db: "iotvtool" } ,
          { role: "dbAdmin", db: "iotvtool" } 
          ]
        }
      )
      ```

## Install Small IOT Test & Verify Tool UI application

1. Clone source code from github and install libraries.

   ```
   git clone https://xxx.com/iot-vtool.git
   cd iot-vtool
   npm install
   cd _public
   bower install
   ```
   
1. Start application

   ```
   npm start
   ```
