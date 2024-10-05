#!/bin/sh
IMAGE=blang/latex:ubuntu

if [ "$#" = "1" ] && [ "$1" = "clear" ]; then

  for file in $(find presentation.*)
  do
    if [ $file != "presentation.tex" ]; then
      rm $file
    fi
  done

else

  exec docker run --rm -i --user="$(id -u):$(id -g)" --net=none -v "$PWD":/data "$IMAGE" "$@"

fi