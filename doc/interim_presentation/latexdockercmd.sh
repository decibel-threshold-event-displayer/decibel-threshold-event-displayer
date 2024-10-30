#!/bin/sh
IMAGE=blang/latex:ubuntu

if [ "$#" = "1" ] && [ "$1" = "clear" ]; then

  for file in $(find presentation.*)
  do
    if [ $file != "interim_presentation.tex" ]; then
      rm $file
    fi
  done

elif [ "$# = 0" ]; then

  exec docker run --rm -i --user="$(id -u):$(id -g)" --net=none -v "$PWD":/data "$IMAGE" "pdflatex" "interim_presentation.tex"

else

  echo "usage: ./latexdockercmd.sh [options]"
  echo "  without options: builds presentation.tex with pdflatex in a docker container"
  echo "  options:"
  echo "    - clear: deletes all latex related build files from the directory"

fi