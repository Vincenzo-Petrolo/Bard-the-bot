# Bard-the-bot
Bot helper for discord. It helps dungeon master to change the soundtrack during its narration. How does it works? It catches keywords in your sentences and plays a soundtrack. The soundtrack are customizable as well as the features.

## Video demonstration
Coming soon....

## Commands

+    \join ----->
         to join the chat

+    \addsong  name [htps:\\.....] ----->
        add the name and [url] to the songs.json

+    \rmsong name ----->
        remove the song from songs.json

+    \churl name newUrl -----> (TODO)
        change url to a song inside songs.json



## Dependencies
Ensure you have nodejs installed, alongside with npm. You need to install on your system:
+ Sox
+ ffmpeg
+ wget
+ npm
+ make

## Installing
Clone the directory with : 

``` git clone https://github.com/Vincenzo-Petrolo/Bard-the-bot.git ```

Move into the folder :

``` cd Bard-the-bot ```

Make the installer executable :
``` chmod +x intaller.sh ```

Run the installer, which will install the italian models :

``` ./installer.sh ```

## Configuration
In order to run the discord Bot, edit the ```tokens.json``` file and fill it
with your discord bot token. The ```dungeon_master``` entry is the username of 
the one whom will be listened from the bot.

## Running
``` npm start ```

## TODO
Here's a list of things that needs to be developed :
+ Multi-language support (Only italian now);
+ Write a Dockerfile in order to deploy the project much easier;