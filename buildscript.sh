#!/bin/bash

colors=("red" "orange" "blue" "green" "pink" "gray")
css_file="./public/style.css"
docker_file="./Dockerfile"
image_name="betapenguin/demoapp-color"

version=$(npm pkg get version | sed -r 's/"//g')

echo "== Buildscript started for v$version"

# Loop through the colors and perform the replacements
for color in "${colors[@]}"; do
    echo "== Building image for color $color"

    # Remove old image
    docker image rm "$image_name:$color"

    # Replace the line containing "--main-color: var(*)" with "--main-color: var(--$color)"
    sed -i "s/--main-color: var\(\S*\)/--main-color: var(--$color);/" "$css_file"

    # Replace the env variable version in the docker file
    sed -i "s/ENV VERSION=.*/ENV VERSION=$version-$color/" "$docker_file"

    # Build the Docker image with the specified tag
    docker build -t "$image_name:$color" .

    # Push the Docker image
    echo "==Uploading image to docker hub"
    # docker push "$image_name:$color"
done

docker image rm "$image_name:latest"
docker tag "$image_name:${colors[0]}" "$image_name:latest"
docker push "$image_name:$color"

echo "== Done building images"
docker images $image_name

# Undo the changes
echo "== Changing back the edited files"

# Change back css color
sed -i "s/--main-color: var\(.*\)/--main-color: var(--red);/" "$css_file"

# Change back version
sed -i "s/ENV VERSION=.*/ENV VERSION=$version/" "$docker_file"
