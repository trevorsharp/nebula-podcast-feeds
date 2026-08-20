# Nebula Podcast Feeds

Create podcast feeds from Nebula channels

## Features

- Provide podcast feeds for Nebula users that you support
- Stream new videos from Nebula in the podcast app of your choice
- Optionally download videos as MP4 files for improved podcast app compatibility

## Self-Hosted Setup Using Docker

Prerequisites:

- Ensure Docker is set up and running on your machine (https://docs.docker.com/get-docker)
- Set up a hostname that can be used to access your machine from the internet (can use a static IP address as well)

To run this application using Docker:

1. Create the `docker-compose.yml` file as described below
2. Run `docker-compose up -d` in the folder where your `docker-compose.yml` lives
3. Check the logs using `docker-compose logs -f` to see if there are any errors in your configuration
4. Add podcasts to your podcast player of choice. Just specify the Nebula channel in the URL `https://example.com/NebulaChannel`

### docker-compose.yml

```
services:
  nebula-podcast-feeds:
    image: trevorsharp/nebula-podcast-feeds:latest
    container_name: nebula-podcast-feeds
    restart: unless-stopped
    ports:
      - 80:3000
    environment:
      - 'NEBULA_AUTH_TOKEN=XXXXXXXXXXXXXX'
```

1. Create a file named `docker-compose.yml` with the contents above
2. Find your Nebula auth token by logging into your Nebula account and finding the cookie value for `nebula_auth.apiToken`
3. Add your Nebula auth token to the `NEBULA_AUTH_TOKEN` environment variable

### Download Videos (Optional)

By default, video enclosures redirect to Nebula's HLS stream. To require locally downloaded MP4 files instead, enable downloads and mount persistent storage:

```yml
services:
  nebula-podcast-feeds:
    image: trevorsharp/nebula-podcast-feeds:latest
    container_name: nebula-podcast-feeds
    restart: unless-stopped
    ports:
      - 80:3000
    environment:
      - 'NEBULA_AUTH_TOKEN=XXXXXXXXXXXXXX'
      - 'DOWNLOAD_VIDEOS=true'
    volumes:
      - ./content:/app/content
```

The newest video is queued when its feed is requested. Other videos are queued when a podcast app requests them and return `503 Service Unavailable` until their downloads finish. Download mode does not fall back to HLS.

Downloaded videos are not automatically removed and can consume significant disk space. Everything in the mounted `content` folder is publicly accessible through the web server, so it should contain only downloaded video files.
