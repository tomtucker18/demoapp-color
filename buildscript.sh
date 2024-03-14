#!/bin/bash

log_info() {
  printf "$(date +%H:%M:%S)\033[38;5;61m ==>\033[0;00m $@\n"
}

colors=("red" "orange" "blue" "green" "pink" "gray")
css_file="./public/style.css"
docker_file="./Dockerfile"
image_name="betapenguin/demoapp-color"

version=$(npm pkg get version | sed -r 's/"//g')

log_info "Buildscript started for v$version"

# Remove old images
if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "$image_name"; then
    If one or more images exist, remove them
    docker rmi $(docker images --format '{{.Repository}}:{{.Tag}}' | grep "$image_name")
    log_info "Docker images with name '$image_name' removed."
else
    log_info "No existing Docker images found with name '$image_name'."
fi

# Loop through the colors and perform the replacements
for color in "${colors[@]}"; do
    log_info "Building image for color $color"

    # Replace the line containing "--main-color: var(*)" with "--main-color: var(--$color)"
    sed -i "s/--main-color: var\(\S*\)/--main-color: var(--$color);/" "$css_file"

    # Replace the env variable version in the docker file
    sed -i "s/ENV VERSION=.*/ENV VERSION=$version-$color/" "$docker_file"

    # Build the Docker image with the specified tag
    docker build -t "$image_name:$version-$color" .
    
    # Tag the Docker image only with the color
    docker tag $image_name:$version-$color $image_name:$color 

    # Push the Docker images
    log_info "Uploading image to docker hub"
    docker push "$image_name:$color"
done

# Manage non-color tags
docker tag "$image_name:${colors[0]}" "$image_name:latest"
docker tag "$image_name:${colors[0]}" "$image_name:$version"
docker push "$image_name:latest"
docker push "$image_name:$version"

log_info "Done building images"
docker images $image_name

# Undo the changes
log_info "Changing back the edited files"

# Change back css color
sed -i "s/--main-color: var\(.*\)/--main-color: var(--red);/" "$css_file"

# Change back version
sed -i "s/ENV VERSION=.*/ENV VERSION=$version/" "$docker_file"
