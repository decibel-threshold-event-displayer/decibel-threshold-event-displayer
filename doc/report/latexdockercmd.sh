#!/bin/sh
IMAGE=blang/latex:ubuntu

if [ "$#" = "1" ] && [ "$1" = "clear" ]; then

  for file in $(find report.*)
  do
    if [ $file != "report.tex" ]; then
      rm $file
    fi
  done

elif [ "$#" = "0" ]; then

  exec docker run --rm -i --user="$(id -u):$(id -g)" --net=none -v "$PWD":/data "$IMAGE" "pdflatex" "report.tex"

else

  echo "usage: ./latexdockercmd.sh [options]"
  echo "  without options: builds report.tex with pdflatex in a docker container"
  echo "  options:"
  echo "    - clear: deletes all latex related build files from the directory"

fi