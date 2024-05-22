# Demoapp Color 🎨

This small Node.js app is designed to serve as a demonstration image on Kubernetes or other container platforms.

![demoapp-color-screenshot](https://github.com/tomtucker18/demoapp-color/assets/48351489/c95ee065-5318-4641-80c6-1355995d31fd)

## Run the app

### Docker

```shell
docker run -d -p 8080:8080 betapenguin/demoapp-color:green
```

### Locally

Make sure you have NodeJS v20 installed.

- `npm install`
- `node server.js`
- Open <http://localhost:8080>

## Features

### Color

The app can be colored in 6 different colors. Each color version has it's own image tag.

| Tag Name | Hex-Code  |
| -------- | --------- |
| red      | `#d44040` |
| orange   | `#e76a37` |
| blue     | `#8686b5` |
| green    | `#3f8b3f` |
| pink     | `#e97bb7` |
| gray     | `#838383` |

### Hostname

The app displays the hostname of the machine the app is running on.

### Successrate Metric

The app exposes a metric endpoint on `/metrics`. There is a custom gauge metric called **custom_success_rate**. It is a floating number between 0 and 1 that simulates the percentage of successful requests.

```text
# HELP custom_success_rate decimal success rate precentage 1 = 100%, 0.3 = 30%
# TYPE custom_success_rate gauge
custom_success_rate{version="1.0.0",hostname="example.local"} 0.31
```

The successrate value can be changed in two ways.

1. GET Request to the url `/set?value=0.98`
2. Over the GUI at `/successrate`

### Version

On the page `/version` you can see the version number that was configured over the env variable.

## Configuration

The following ENV variables can be set to configure the application.

| Name          | Description                                                   | Default Value             |
| ------------- | ------------------------------------------------------------- | ------------------------- |
| **PORT**      | Port where the application should be started                  | 8080                      |
| **VERSION**   | App version                                                   | image version (eg. 1.3.1) |
| **THRESHOLD** | Threshold from where the successrate is considered successful | 0.95                      |

## Build & Publish

There is a [`buildscript.sh`](./buildscript.sh) which automatically builds and publishes the app.

**Be really careful with this script!**

It builds and tags the docker images and pushes them to the Docker Hub. It overwrites the existing images. So make sure you only run the script if the changes you've applied are ready to be released.

### Buildprocess

1. Update the version field in the package.json file according to semver.
2. Update the `ENV VERSION` variable in the Dockerfile to the same version like package.json
3. Commit all the changes and create a version tag.
4. Log into Docker Hub with `docker login -u betapenguin`
5. Run the script `./buildscript.sh`
6. Check if the images are uploaded and make sure they are working properly.
