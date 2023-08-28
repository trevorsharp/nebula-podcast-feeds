# Nebula Podcast Feeds

Create video podcast feeds from Nebula content

## Features

- Provide podcast feeds for Nebula users that you support
- Stream new videos from Nebula in the podcast app of your choice

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
version: '3'
services:
  nebula-podcast-feeds:
    image: trevorsharp/nebula-podcast-feeds:latest
    container_name: nebula-podcast-feeds
    restart: unless-stopped
    ports:
      - 80:3000
    environment:
      - 'NEBULA_EMAIL=email@example.com'
      - 'NEBULA_PASSWORD=XXXXXXXXXXXXXX'
```

1. Create a file named `docker-compose.yml` with the contents above
2. Add your Nebula account email and password to the environment variables
