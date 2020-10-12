# DEPLOYMENT

When deploying to the server make sure that everything have been tested and run well in local. It's a production server not a toy ! Be carefull and don't be afraid to ask some help if you need !

Please note that the workflow is straightforward if something wrong happen for any reasons. You have to be able to manage it and try to fit as much as possible the workflow.

## Workflow
**NOTE:**

```
After cloning the project make sure you have the right access to the
forticlientVPN to be connect to the postgresql DB
and the ASN server with ssh.
You need to be connect to the VPN server !
```
To get it please refer to [Hugues Pringault](hpringault@starclay.fr)

### Part 1 - Test `develop`
---

1. Once the new patch is ready and merged in the `develop` branch.
Clone the project into a `tmp` folder out of your `asn-webapp` folder.
```bash
cd && mkdir -p tmp
```
```bash
git clone git@gitlab.com:hpringault/asn-webapp.git
```

```bash
cd asn-webapp && git checkout develop && yarn
```

2. Now install the project and test it with the production DB.
Please refer to the `Run it` section in the README to know how to launch the server and client with the production DB.
  Check if everything is running well and the changes doesn't create new bugs and of course resolve the existing ones.

### Part 2 - Package it
---

1. Stop the client and server.
Check `default.json` file in `asn-webapp/config`, it has to be like this:
```json
{
  "port": 3011,
  "logLevel": "info",

}
```

2. Next step create the build client :
```bash
REACT_APP_API_ENDPOINT=http://siance-annotation.asn.i2:3011 npm run build
```

3. remove the `package-lock.json` :
```bash
rm package-lock.json
```

4. Get out of the `asn-webapp` and zip it :
```bash
cd .. && zip -r asn-webapp.zip asn-webapp
```

**NOTE :**
Yes we zip the `node_module` too, you can delete it before but it's not mandatory.

### Part 3 - Clean the server and send zip file :fire:
---

1. Open a new terminal and connect to the ASN server :
```bash
ssh 192.168.210.197 -l starclay
```

2. Once you are in delete the zip files :
```bash
rm asn-webapp.zip
```

3. Stop the existing process :
    - first find them with :
    ```bash
    ps aux | grep node
    ```
    it will looks like this :
    ![ps aux](src/assets/psaux.png)
     - Now kill the 3 process with :
     ```bash
     kill -9 {PID}
     ```
     - replace {PID} by the actual PID here it's: `4486`, `4487` and `4504`
       Of course it will not be the same for you :smile:

4. Now remove the `asn-webapp` and `build` folders
```bash
sudo rm -rf asn-webapp build
```

5. Go back in your in `tmp` folder where your zip file is located and send it to the server.
Of course don't close your ssh connection use an other terminal :wink:
```bash
scp asn-webapp.zip starclay@192.168.210.197:/home/starclay
```
### Part 4 - Serve package :fire:
---

1. Go back in the terminal where your ssh connection has been made.

2. unzip `asn-webapp.zip'
```bash
unzip asn-webapp.zip
```

3. Go into the `asn-webapp` folder and re-install the node_modules just in case
```bash
cd asn-webapp && npm install
```

4.Copy the build folder in `/home/starclay`
```bash
cp -r build/ /home/starclay
```
5. Serve the server :
```bash
sudo nohup node server/bootstrap.js 2>&1 > ../server_asn_logs.out &
```

6. And now go back in `/home/starclay` and serve the build:
```bash
cd /home/starclay && sudo nohup serve -s build/ -p 80 2>&1 > web_asn_logs.out &
```

7. Open your favorites webbrowser and go to the URL: http://192.168.210.197
  try to log in with your starclay account. If you can CONGRATULATION :tada::tada:

8. Test again the website like in `Step 1` if everything is oke.

    You successfully deploy the new patch !! :muscle: :fire: :fire: :muscle:

**NOTE:**
There is a script named `server_app.sh` who does the same as `step4` but for the moment do not use it please.

## Authors
* **Junique Virgile** - *Initial contributor* - [Junique Virgile](https://github.com/werayn)
