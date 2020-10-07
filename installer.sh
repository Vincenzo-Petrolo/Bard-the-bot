#!/bin/sh
#Installing modules dependencies
npm install
#Download the italian model
wget https://github.com/MozillaItalia/DeepSpeech-Italian-Model/releases/download/2020.08.07/transfer_model_tensorflow_it.tar.xz
#Create a directory for the models
mkdir model
#Extract the archive into model
tar xfv transfer_model_tensorflow_it.tar.xz -C model
#Remove the archive
rm -f transfer_model_tensorflow_it.tar.xz